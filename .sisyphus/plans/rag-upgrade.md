# Enterprise RAG Upgrade — Work Plan

**Goal**: Upgrade AgriServe's chatbot into an enterprise-grade hybrid RAG system with zero hallucination, PII protection, RBAC enforcement, audit logging, geospatial retrieval, and a rolling conversation memory.

**Model**: Keep Cloudflare BGE (768d) — no re-embedding needed  
**Deployment**: Vercel serverless — queue worker via Cron + API route  
**Cache**: In-memory LRU — no Redis  
**Memory tables**: Only `ai_chat_context`  
**Tests**: Bun test  
**Enterprise features (Section 11)**: Deferred to Phase 2

---

## Architecture Overview (post-upgrade)

```
User Message
     │
     ▼
[Rate Limiter] ──── (429 if exceeded)
     │
     ▼
[RBAC Middleware] ── (403 if unauthorized)
     │
     ▼
[Intent Classifier] (existing, enhance)
     │
     ├──── SQL path ────────► [Structured DB Service]
     │                              │
     │                         [PII Policy] ── mask/reveal per RBAC
     │                              │
     │                        STRUCTURED_FACTS_JSON
     │
     ├──── Vector path ──────► [PII-scrubbed Embeddings]
     │                              │
     │                         [Similarity Search] threshold ≥ 0.75
     │                              │
     │                        SEMANTIC_KNOWLEDGE_TEXT
     │
     ├──── Memory path ──────► [ai_chat_context rolling summary]
     │                              │
     │                        CONVERSATION_CONTEXT
     │
     └──────────────────────────────┤
                                    ▼
                        [Hybrid Context Injector]
                      STRUCTURED_FACTS_JSON +
                      SEMANTIC_KNOWLEDGE_TEXT +
                      CONVERSATION_CONTEXT
                                    │
                                    ▼
                          [LLM — Grounded Mode]
                      "Answer only from context.
                       If not present → say so."
                                    │
                                    ▼
                      [Response + Source Attribution]
                        (DB: table.column) / (KB: embeddings)
                                    │
                                    ▼
                         [Audit Logger] ← PII queries only
```

---

## Tasks

---

### TASK 1 — Database: `ai_chat_context` table migration

**File**: `supabase/migrations/033_ai_chat_context.sql`

**What to build**:
Create the `ai_chat_context` table for rolling conversation summaries with vector embedding support.

```sql
CREATE TABLE ai_chat_context (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  TEXT NOT NULL,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rolling_summary  TEXT NOT NULL DEFAULT '',
  embedding    vector(768),
  message_count    INT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_ai_chat_context_conv ON ai_chat_context(conversation_id);
CREATE INDEX idx_ai_chat_context_user ON ai_chat_context(user_id);
CREATE INDEX idx_ai_chat_context_embedding ON ai_chat_context
  USING hnsw (embedding vector_cosine_ops);

ALTER TABLE ai_chat_context ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own context
CREATE POLICY "Users can manage own chat context"
  ON ai_chat_context FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full access on ai_chat_context"
  ON ai_chat_context FOR ALL TO service_role
  USING (true) WITH CHECK (true);
```

**Acceptance**: Migration runs without error. Table exists with RLS enforced. HNSW index created.

---

### TASK 2 — Database: `audit_logs` table migration

**File**: `supabase/migrations/034_audit_logs.sql`

**What to build**:
Create append-only audit log table for all PII queries made by the AI system.

```sql
CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     UUID,                        -- user making the request
  actor_role   TEXT,                        -- their active role at time of query
  action       TEXT NOT NULL,               -- 'pii_query', 'embedding_query', 'sql_query'
  resource     TEXT NOT NULL,               -- e.g. 'user_profiles.phone'
  target_id    UUID,                        -- the record being accessed
  data_scope   JSONB DEFAULT '{}',          -- what fields were accessed
  ip_address   TEXT,
  request_id   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at DESC);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can write audit logs (append-only from server)
CREATE POLICY "Service role full access on audit_logs"
  ON audit_logs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Admins can read audit logs
CREATE POLICY "Admins can read audit_logs"
  ON audit_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );
```

**Acceptance**: Migration runs. Table is append-only for non-service clients. Admins can SELECT.

---

### TASK 3 — Security: RBAC middleware for AI data access

**File**: `src/lib/rag/rbac.ts` (new file)

**What to build**:
A standalone RBAC module consumed by the database service and chat route. Must fail closed.

```typescript
export type AIRole = 'guest' | 'farmer' | 'provider' | 'labour' | 'admin';

export interface AIRequestContext {
  userId?: string;
  roles: AIRole[];
  activeRole: AIRole;
  isAuthenticated: boolean;
  requestId: string; // for audit trail correlation
  ipAddress?: string;
}

export interface RBACDecision {
  allowed: boolean;
  reason: string;
  maskedFields?: string[]; // fields that will be masked in response
}

// Core capability checks — fail closed (return false) on any doubt
export function canAccessPII(ctx: AIRequestContext, targetUserId?: string): RBACDecision;
export function canAccessPayments(ctx: AIRequestContext, targetUserId?: string): RBACDecision;
export function canAccessAdminData(ctx: AIRequestContext): RBACDecision;
export function canQueryTable(ctx: AIRequestContext, table: string): RBACDecision;
```

**Rules**:

- Guest → can only access public equipment listings and labour profiles (non-PII)
- Authenticated farmer/provider/labour → can access own data (user_id match), public data, no other users' PII
- Admin → can access all data, all PII
- PII fields (phone, email, exact GPS) → only own user_id OR admin, never cross-user
- Any unrecognized role → deny by default
- Missing userId on authenticated context → deny

**Acceptance**: Unit tests (Bun) covering: guest blocked from PII, user blocked from other user's PII, user allowed own PII, admin allowed all, unknown role denied.

---

### TASK 4 — Security: Audit logging service

**File**: `src/lib/rag/audit-logger.ts` (new file)

**What to build**:
Lightweight audit logging service that writes to `audit_logs`. Fire-and-forget (never blocks request).

```typescript
export interface AuditEvent {
  actorId?: string;
  actorRole?: string;
  action: 'pii_query' | 'sql_query' | 'vector_query' | 'pii_denied';
  resource: string; // e.g. 'user_profiles.phone'
  targetId?: string;
  dataScope?: Record<string, unknown>;
  ipAddress?: string;
  requestId?: string;
}

export async function logAuditEvent(event: AuditEvent): Promise<void>;
export async function logPIIAccess(
  ctx: AIRequestContext,
  resource: string,
  targetId: string,
  fields: string[]
): Promise<void>;
export async function logPIIDenied(
  ctx: AIRequestContext,
  resource: string,
  targetId: string
): Promise<void>;
```

**Rules**:

- Uses `createAdminClient()` — bypass RLS to always write
- All writes are fire-and-forget (`void` — catch and `console.error` only, never throw)
- Never log actual PII values — only `resource` and `fields` names
- Every PII read AND every PII denial is logged

**Acceptance**: Unit test — log call never throws even if DB is unavailable. PII read and PII denied both produce rows with correct fields.

---

### TASK 5 — Embedding: PII scrubber

**File**: `src/lib/rag/pii-scrubber.ts` (new file)

**What to build**:
Scrubs PII from text before it's embedded. Runs on all content before `generateEmbedding()` is called in `knowledge-service.ts`.

```typescript
// Patterns to redact
const PII_PATTERNS = [
  { name: 'email', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, mask: '[EMAIL]' },
  { name: 'phone', regex: /(\+91[\-\s]?)?[6-9]\d{9}/g, mask: '[PHONE]' },
  {
    name: 'phone_intl',
    regex: /\+\d{1,3}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}/g,
    mask: '[PHONE]',
  },
  { name: 'pincode', regex: /\b[1-9][0-9]{5}\b/g, mask: '[PIN]' },
  { name: 'aadhaar', regex: /\b\d{4}\s?\d{4}\s?\d{4}\b/g, mask: '[ID]' },
  { name: 'pan', regex: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g, mask: '[PAN]' },
];

export function scrubPII(text: string): { scrubbed: string; detected: string[] };
// Returns scrubbed text and list of PII type names found
```

**Integration point**: Call `scrubPII()` inside `formatEquipmentContent()`, `formatUserContent()`, `formatLabourContent()`, `formatReviewContent()`, `formatBookingContent()` in `knowledge-service.ts` before the content string is used for embedding generation. Logging detected PII types (not values) is acceptable.

**Rules**:

- Never throw — if scrubber fails, use original text and log warning
- Patterns are additive — easy to extend
- Does NOT affect structured SQL queries — only embedding content

**Acceptance**: Unit tests: email in bio is masked, Indian phone number masked, pincode masked, clean text unchanged.

---

### TASK 6 — Integration: Wire PII scrubber into knowledge-service

**File**: `src/lib/services/knowledge-service.ts` (modify existing)

**What to build**:
Apply `scrubPII()` to the output of each `format*Content()` call before it is passed to `generateEmbedding()`.

```typescript
// Before (in syncEquipment, syncUsers, etc.)
const content = formatEquipmentContent(item);
const embeddingResult = await generateEmbedding(content);

// After
const rawContent = formatEquipmentContent(item);
const { scrubbed: content, detected } = scrubPII(rawContent);
if (detected.length > 0) {
  console.warn(
    `[knowledge-service] PII detected and scrubbed from equipment ${item.id}:`,
    detected
  );
}
const embeddingResult = await generateEmbedding(content);
// Store scrubbed content in knowledge_embeddings (not raw)
```

**Rules**:

- Store the **scrubbed** content in `knowledge_embeddings.content` — not the raw text
- The scrubbed content is also what the LLM sees via context-builder
- All 5 sync functions: `syncEquipment`, `syncUsers`, `syncLabour`, `syncReviews`, `syncBookings`
- Queue processor (`/api/knowledge/process-queue/route.ts`) and webhook (`/api/knowledge/webhook/route.ts`) must also scrub

**Acceptance**: After re-sync, `knowledge_embeddings.content` contains no raw phone/email patterns. Verified by querying the table.

---

### TASK 7 — RAG: Anti-hallucination enforcement

**Files**:

- `src/lib/rag/context-builder.ts` (modify)
- `src/app/api/chat/route.ts` (modify)

**What to build**:

#### 7a. Raise similarity threshold to 0.75

In `context-builder.ts`:

```typescript
// Before
const threshold = options?.threshold ?? 0.5;

// After
const threshold = options?.threshold ?? 0.75;
```

In `smart-query-service.ts` vector search path (around line 1996):

```typescript
// Before
threshold: 0.5,

// After
threshold: 0.75,
```

#### 7b. Source attribution tags in formatted context

In `context-builder.ts`, every formatted item must include a source tag:

```
[Equipment: John Deere 5310] (DB: knowledge_embeddings / equipment:uuid) [Similarity: 92.3%]
```

Specifically:

- Equipment items: tag `(DB: equipment.id={sourceId})`
- Labour items: tag `(DB: labour_profiles.id={sourceId})`
- Reviews: tag `(DB: reviews.id={sourceId})`
- Bookings: tag `(DB: bookings.id={sourceId})`
- Users: tag `(DB: user_profiles.id={sourceId})`

#### 7c. Hybrid context format — structured JSON + semantic text

Replace the current markdown-only context injection in `src/app/api/chat/route.ts` with two clearly separated blocks:

```
=== STRUCTURED_FACTS_JSON ===
{
  "retrieved_at": "ISO timestamp",
  "query_type": "vector_search | sql | hybrid",
  "user": { ... },
  "has_db_results": true/false,
  "result_count": N
}
=== END STRUCTURED_FACTS ===

=== SEMANTIC_KNOWLEDGE_TEXT ===
[formatted context from context-builder with source tags]
=== END SEMANTIC_KNOWLEDGE ===
```

#### 7d. Grounded system prompt mode

Add a strict grounding block to the LLM system prompt in `chat/route.ts`:

```
GROUNDING RULES (MANDATORY — never ignore):
1. Answer ONLY from STRUCTURED_FACTS_JSON and SEMANTIC_KNOWLEDGE_TEXT provided above.
2. If the answer is not present in the context → respond: "I don't have that information in the current data."
3. Never guess, extrapolate, or use training knowledge for facts about users, equipment, prices, or bookings.
4. Always cite your source: (DB: table) or (KB: embeddings) at the end of factual claims.
5. If similarity scores are all below 75% → acknowledge low confidence.
6. For counts, prices, dates, and names: use exact values from context only.
```

**Acceptance**: Test with a query for a non-existent equipment name → response says "not found", no fabrication. Test with a real equipment query → response includes source tag. Similarity threshold change verified in logs.

---

### TASK 8 — RAG: PII access policy with data masking

**File**: `src/lib/rag/pii-policy.ts` (new file)

**What to build**:
Policy layer that sits between the DB query results and the LLM context. Masks or reveals PII fields based on RBAC decision.

```typescript
export interface PIIField {
  field: string;
  value: unknown;
  isSensitive: boolean;
}

// Mask a single value
export function maskValue(value: string, type: 'phone' | 'email' | 'location'): string;
// phone: +91 98765 43210 → +91 98765 XXXXX
// email: john@example.com → j***@example.com
// location: exact coords → [Location Hidden]

// Apply policy to a user profile result before sending to LLM
export function applyPIIPolicy(
  data: Record<string, unknown>,
  ctx: AIRequestContext,
  targetUserId?: string
): { sanitized: Record<string, unknown>; maskedFields: string[]; auditRequired: boolean };
```

**Integration**:

- Called in `smart-query-service.ts` for every user profile fetch that includes phone/email/location
- `auditRequired = true` → caller must call `logPIIAccess()` or `logPIIDenied()`

**Rules**:

- Own data + authenticated → full reveal + audit log
- Other user's data → mask phone, email, exact GPS
- Admin → full reveal + audit log
- Guest → mask all sensitive fields, return public fields only

**Acceptance**: Unit tests: guest gets masked phone, own user gets real phone + audit row created, cross-user gets masked phone, admin gets real phone + audit row.

---

### TASK 9 — Smart Query: Payments, earnings, notifications intents

**File**: `src/lib/services/smart-query-service.ts` (modify)

**What to build**:
Add 3 new structured SQL intent handlers. The intent classifier already partially handles these — fill in the actual DB query implementations.

#### 9a. `my_payments` intent

```typescript
async function handleMyPayments(userId: string): Promise<SmartQueryResult>;
// Query: SELECT payments.*, bookings.id, equipment.name
//        FROM payments JOIN bookings ON payments.booking_id = bookings.id
//        JOIN equipment ON bookings.equipment_id = equipment.id
//        WHERE bookings.renter_id = userId OR bookings.provider_id = userId
//        ORDER BY payments.created_at DESC LIMIT 10
// Apply PII policy before returning (no PII here, but log access)
```

#### 9b. `my_earnings` intent

```typescript
async function handleMyEarnings(userId: string): Promise<SmartQueryResult>;
// Query: SELECT * FROM earnings WHERE provider_id = userId ORDER BY created_at DESC LIMIT 20
// Summarize: total earned, pending, last payment date
```

#### 9c. `my_notifications` intent

```typescript
async function handleMyNotifications(userId: string): Promise<SmartQueryResult>;
// Query: SELECT * FROM notifications WHERE user_id = userId AND read = false
//        ORDER BY created_at DESC LIMIT 20
// Format: unread count, list of notification summaries
```

**Wire into classifier**: Add `'my_payments'`, `'my_earnings'`, `'my_notifications'` to the `IntentType` union and add detection keywords in the intent classifier function. Route to the new handlers in the main `switch` statement.

**Acceptance**: Each intent returns correct data for an authenticated user. Unauthorized access (wrong userId) blocked by RBAC check at handler entry.

---

### TASK 10 — Memory: `ai_chat_context` service

**File**: `src/lib/rag/chat-memory.ts` (new file)

**What to build**:
Service for reading and updating rolling conversation summaries stored in `ai_chat_context`.

```typescript
export interface ChatMemory {
  conversationId: string;
  rollingSummary: string;
  messageCount: number;
  embedding?: number[];
}

// Get or initialize memory for a conversation
export async function getOrCreateChatMemory(
  conversationId: string,
  userId?: string
): Promise<ChatMemory>;

// Update rolling summary after each exchange (append new turn, summarize if > 10 turns)
export async function updateChatMemory(
  conversationId: string,
  userMessage: string,
  assistantResponse: string,
  userId?: string
): Promise<void>;

// Search past conversations semantically (for "we talked about X before")
export async function searchChatMemory(userId: string, query: string): Promise<ChatMemory[]>;
```

**Summarization strategy**:

- Keep last 5 exchanges verbatim
- When `message_count > 10`: compress oldest 5 into 1-2 sentence summary
- Never embed raw messages — only the compressed summary
- Re-generate embedding on every summary update

**Integration**: Called in `src/app/api/chat/route.ts`:

1. At request start: `getOrCreateChatMemory(conversationId)` → inject `rollingSummary` into system prompt
2. After LLM response: `updateChatMemory(...)` fire-and-forget

**Acceptance**: After 3 exchanges, memory row exists. After 12 exchanges, old turns are compressed. Semantic search on "what equipment did I ask about?" returns relevant past context.

---

### TASK 11 — Geospatial: Labour radius search

**File**: `src/lib/services/labour-service.ts` (modify existing)

**What to build**:
Add a `findLabourNearby()` function that uses PostGIS `ST_DWithin` to find labour within a radius.

```typescript
export interface LabourNearbyOptions {
  lat: number;
  lng: number;
  radiusKm: number; // default 50
  skills?: string[];
  maxResults?: number; // default 20
}

export async function findLabourNearby(options: LabourNearbyOptions): Promise<LabourProfile[]>;
```

**SQL to use** (via Supabase RPC or raw):

```sql
SELECT lp.*,
       ST_Distance(
         lp.location::geography,
         ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography
       ) / 1000 AS distance_km
FROM labour_profiles lp
WHERE lp.is_active = true
  AND ST_DWithin(
    lp.location::geography,
    ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography,
    $radius_meters
  )
  AND ($skills IS NULL OR lp.skills && $skills)
ORDER BY distance_km ASC
LIMIT $max_results;
```

**Also**: Add a `nearby_labour` intent to `smart-query-service.ts` that parses location from the user message context (from `userContext.location`) and calls `findLabourNearby()`.

**Fallback**: If labour profiles don't have a `location` geometry column, fall back to `location_name` text match. Add a `-- TODO: add location geometry column to labour_profiles` comment.

**Acceptance**: Query with lat/lng returns labour sorted by distance. Skills filter works. Radius boundary is respected (±5% tolerance).

---

### TASK 12 — Performance: Enhanced in-memory LRU cache

**File**: `src/lib/rag/query-cache.ts` (new file)

**What to build**:
A proper LRU cache replacing the ad-hoc `Map`-based cache in `smart-query-service.ts`. Cache both embeddings AND full query results.

```typescript
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hitCount: number;
}

export class LRUCache<T> {
  constructor(maxSize: number, ttlMs: number);
  get(key: string): T | null;
  set(key: string, value: T): void;
  delete(key: string): void;
  clear(): void;
  size(): number;
  stats(): { size: number; hits: number; misses: number; hitRate: string };
}

// Singleton caches used across the request lifecycle
export const embeddingCache = new LRUCache<number[]>(200, 5 * 60 * 1000); // 5 min TTL
export const queryResultCache = new LRUCache<SmartQueryResult>(100, 2 * 60 * 1000); // 2 min TTL
export const userProfileCache = new LRUCache<Record<string, unknown>>(500, 1 * 60 * 1000); // 1 min TTL
```

**Cache key strategy**:

- Embedding cache: `normalize(query)` (lowercase, trim, collapse whitespace)
- Query result cache: `${intentType}:${userId ?? 'guest'}:${normalize(query)}` — user-scoped to prevent data leaks
- User profile cache: `profile:${userId}` — never cache PII fields, only public profile data

**Migration**: Replace the existing `embeddingCache` Map in `smart-query-service.ts` with `import { embeddingCache } from '@/lib/rag/query-cache'`.

**Acceptance**: Cache hit rate appears in `stats()`. Two identical queries only call `generateEmbedding()` once. User A's cached result never returned to User B (different cache key).

---

### TASK 13 — Performance: Rate limiting for AI queries

**File**: `src/lib/rag/rate-limiter.ts` (new file)

**What to build**:
Per-user in-memory rate limiter using a sliding window. Applied in `chat/route.ts` before smart query execution.

```typescript
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfterMs?: number;
}

export class SlidingWindowRateLimiter {
  constructor(maxRequests: number, windowMs: number);
  check(identifier: string): RateLimitResult;
  reset(identifier: string): void;
}

// Singleton limiters
export const aiQueryRateLimiter = new SlidingWindowRateLimiter(
  30, // 30 AI chat requests
  60 * 1000 // per 60 seconds
);

export const embeddingRateLimiter = new SlidingWindowRateLimiter(
  10, // 10 embedding generations
  60 * 1000 // per 60 seconds
);
```

**Identifiers**:

- Authenticated user: `user:${userId}`
- Guest: `ip:${ipAddress}` (from `x-forwarded-for` header)

**Integration**: In `src/app/api/chat/route.ts`, after auth check:

```typescript
const rateLimitResult = aiQueryRateLimiter.check(userId ?? ipAddress);
if (!rateLimitResult.allowed) {
  return new Response(
    JSON.stringify({ error: 'Rate limit exceeded', retryAfterMs: rateLimitResult.retryAfterMs }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil(rateLimitResult.retryAfterMs! / 1000)),
      },
    }
  );
}
```

**Acceptance**: 31st request from same user within 60s returns 429. Guest rate limited by IP. Reset after window expires.

---

### TASK 14 — Worker: Vercel Cron for embedding queue

**Files**:

- `vercel.json` (create)
- `src/app/api/cron/process-embeddings/route.ts` (new file)

**What to build**:

#### 14a. Vercel cron config

```json
{
  "crons": [
    {
      "path": "/api/cron/process-embeddings",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

#### 14b. Cron route

New route at `/api/cron/process-embeddings/route.ts`:

- Verify `Authorization: Bearer ${CRON_SECRET}` header (Vercel sets this automatically)
- Call the existing queue processing logic from `/api/knowledge/process-queue`
- Process up to 50 items per cron run (to fit within Vercel function timeout)
- Return `{ processed: N, errors: [...], queueDepth: remaining }`
- Log if queue depth > 200 (backlog warning)

**Reuse**: Extract the queue processing logic from `/api/knowledge/process-queue/route.ts` into a shared function in `src/lib/rag/queue-processor.ts`, imported by both routes.

**Env var needed**: `CRON_SECRET` (add to `.env.example`)

**Acceptance**: Running `GET /api/cron/process-embeddings` with correct auth processes pending queue items. Without auth returns 401. Queue depth logged correctly.

---

### TASK 15 — Tests: Bun test suite for zero hallucination

**Files**:

- `tests/rag/hallucination.test.ts`
- `tests/rag/rbac.test.ts`
- `tests/rag/pii-scrubber.test.ts`
- `tests/rag/rate-limiter.test.ts`
- `tests/rag/cache.test.ts`
- `package.json` (add test script)

**What to build**:

#### 15a. `hallucination.test.ts`

Tests that the context builder and grounded mode enforce no fabrication:

```typescript
// Test: below threshold returns empty context
test('returns empty context when similarity < 0.75', ...)

// Test: non-existent query returns "not found" signal
test('vector search for non-existent term returns hasContext=false', ...)

// Test: source attribution present in formatted output
test('formatted context includes source attribution tags', ...)

// Test: context truncation preserves section boundaries
test('truncateContext breaks at section boundary', ...)
```

#### 15b. `rbac.test.ts`

```typescript
test('guest cannot access PII', ...)
test('user can access own PII', ...)
test('user cannot access other user PII', ...)
test('admin can access all PII', ...)
test('unknown role is denied', ...)
test('missing userId on authenticated context is denied', ...)
```

#### 15c. `pii-scrubber.test.ts`

```typescript
test('scrubs Indian phone number', ...)
test('scrubs email address', ...)
test('scrubs pincode', ...)
test('scrubs Aadhaar pattern', ...)
test('does not modify clean text', ...)
test('returns detected PII type names', ...)
test('never throws on malformed input', ...)
```

#### 15d. `rate-limiter.test.ts`

```typescript
test('allows requests under limit', ...)
test('blocks 31st request in 60s window', ...)
test('resets after window expires', ...)
test('different users have independent limits', ...)
```

#### 15e. `cache.test.ts`

```typescript
test('LRU evicts oldest when full', ...)
test('TTL expiry returns null', ...)
test('user-scoped keys do not leak across users', ...)
test('stats() reports correct hit rate', ...)
```

**package.json addition**:

```json
"scripts": {
  "test": "bun test",
  "test:rag": "bun test tests/rag/",
  "test:watch": "bun test --watch tests/rag/"
}
```

**Acceptance**: `bun test tests/rag/` passes all tests. Zero tests deleted or skipped to pass.

---

## Execution Order

```
Phase A — Foundation (do first, others depend on these)
  TASK 1  — ai_chat_context migration
  TASK 2  — audit_logs migration
  TASK 3  — RBAC middleware
  TASK 4  — Audit logger service
  TASK 5  — PII scrubber

Phase B — Integration (depends on Phase A)
  TASK 6  — Wire PII scrubber into knowledge-service
  TASK 8  — PII access policy + masking
  TASK 12 — LRU cache (replace existing Map-based cache)

Phase C — Enhancement (depends on Phase B)
  TASK 7  — Anti-hallucination enforcement
  TASK 9  — Payments, earnings, notifications intents
  TASK 10 — Chat memory service
  TASK 11 — Labour radius search
  TASK 13 — Rate limiting

Phase D — Infrastructure + Tests (last)
  TASK 14 — Vercel Cron worker
  TASK 15 — Bun test suite
```

---

## Files Created / Modified

### New Files

| File                                           | Type | Description                        |
| ---------------------------------------------- | ---- | ---------------------------------- |
| `supabase/migrations/033_ai_chat_context.sql`  | SQL  | ai_chat_context table + RLS        |
| `supabase/migrations/034_audit_logs.sql`       | SQL  | audit_logs append-only table       |
| `src/lib/rag/rbac.ts`                          | TS   | RBAC capability checks             |
| `src/lib/rag/audit-logger.ts`                  | TS   | Fire-and-forget audit log writer   |
| `src/lib/rag/pii-scrubber.ts`                  | TS   | PII regex scrubber                 |
| `src/lib/rag/pii-policy.ts`                    | TS   | PII mask/reveal policy             |
| `src/lib/rag/chat-memory.ts`                   | TS   | ai_chat_context read/write/search  |
| `src/lib/rag/query-cache.ts`                   | TS   | LRU cache for embeddings + results |
| `src/lib/rag/rate-limiter.ts`                  | TS   | Sliding window rate limiter        |
| `src/lib/rag/queue-processor.ts`               | TS   | Shared queue processing logic      |
| `src/app/api/cron/process-embeddings/route.ts` | TS   | Vercel cron route                  |
| `vercel.json`                                  | JSON | Cron schedule config               |
| `tests/rag/hallucination.test.ts`              | TS   | Anti-hallucination tests           |
| `tests/rag/rbac.test.ts`                       | TS   | RBAC tests                         |
| `tests/rag/pii-scrubber.test.ts`               | TS   | PII scrubber tests                 |
| `tests/rag/rate-limiter.test.ts`               | TS   | Rate limiter tests                 |
| `tests/rag/cache.test.ts`                      | TS   | LRU cache tests                    |

### Modified Files

| File                                           | Change                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| `src/lib/services/knowledge-service.ts`        | PII scrubber integration in all 5 sync functions                                   |
| `src/lib/services/smart-query-service.ts`      | Replace Map cache with LRU, add 3 new intents, bump threshold                      |
| `src/lib/rag/context-builder.ts`               | Source tags, threshold bump, structured JSON format                                |
| `src/lib/services/labour-service.ts`           | Add `findLabourNearby()` with PostGIS                                              |
| `src/app/api/chat/route.ts`                    | RBAC check, rate limit, grounded system prompt, chat memory, hybrid context format |
| `src/app/api/knowledge/process-queue/route.ts` | Refactor to import from `queue-processor.ts`                                       |
| `src/app/api/knowledge/webhook/route.ts`       | Add PII scrubber call                                                              |
| `package.json`                                 | Add `test` script                                                                  |
| `.env.example`                                 | Add `CRON_SECRET`                                                                  |

---

## Guardrails (non-negotiable)

1. **No model migration** — Cloudflare BGE stays. Dimension is 768. Do not change.
2. **No Redis** — In-memory only. LRU cache is process-local.
3. **No persistent worker** — Vercel Cron only. Max 50 queue items per run.
4. **Only `ai_chat_context`** — No other memory tables this phase.
5. **Fail closed** — RBAC denies on any doubt. Never allow on error.
6. **No PII in embeddings** — scrubPII() must run before every `generateEmbedding()` call.
7. **Audit log never throws** — log failures are swallowed, never block requests.
8. **Section 11 deferred** — Trust scores, demand prediction, price suggestion: NOT in this plan.
9. **smart-query-service.ts** — Do NOT refactor/restructure the 2960-line file. Only add to it.
10. **Tests must pass, never skip** — No `test.skip()` or deleted assertions to make tests pass.

---

## Open Items (do not implement, note for Phase 2)

- Re-scrub historical `knowledge_embeddings.content` rows (one-time migration)
- Multilingual PII detection (Hindi phone number formats, regional scripts)
- Geocoding pipeline for labour profiles (to enable PostGIS radius search for all records)
- Redis/Upstash caching when app scales beyond single Vercel instance
- ai_user_memory, ai_booking_summaries, ai_equipment_insights tables
- Enterprise Section 11: trust scores, demand prediction, price suggestion AI
- Audit log hash chain for tamper evidence
- Cross-tenant RBAC (currently single-tenant)
