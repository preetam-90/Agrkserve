# Draft: Enterprise RAG Upgrade

## Requirements (confirmed)

- Upgrade existing chatbot to enterprise-grade RAG system
- Hybrid retrieval: SQL + vector search
- Zero hallucination policy
- PII access control with audit logging
- New memory tables for AI context
- Geo-spatial retrieval enhancements
- Enterprise features (trust scores, demand prediction, price suggestion)

## Current State (researched)

### Already Built (DO NOT rebuild)

- `src/lib/services/embedding-service.ts` — Cloudflare BGE bge-base-en-v1.5 (768d)
- `src/lib/services/knowledge-service.ts` — Sync for equipment, users, labour, reviews, bookings
- `src/lib/rag/context-builder.ts` — Formats context by source type (markdown-style)
- `src/lib/services/smart-query-service.ts` — Intent classification (30+ types) + hybrid retrieval
- `src/app/api/chat/route.ts` — Chat API with smartQuery integration
- `supabase/migrations/028_pgvector_rag_setup.sql` — pgvector, HNSW, knowledge_embeddings, embedding_queue
- `supabase/migrations/029_auto_sync_triggers.sql` — Auto-queue on CRUD
- `supabase/migrations/031_booking_embedding_trigger.sql` — Booking trigger
- `supabase/migrations/032_fix_embedding_queue_permissions.sql` — SECURITY DEFINER fix
- `src/app/api/knowledge/process-queue/route.ts` — Queue processor (API route, not persistent worker)
- `src/app/api/knowledge/webhook/route.ts` — Webhook for real-time embedding

### Needs Enhancement

- Similarity threshold currently 0.5, spec wants 0.75
- Context format is markdown-style, spec wants structured JSON + text
- No source attribution tags in context
- No PII filtering on embedding content (user bios may contain PII)
- Queue processor is API route, not background worker

### Missing (needs building)

- RBAC middleware for AI data access
- Audit logging for sensitive queries
- Anti-hallucination grounded mode + source attribution
- PII access policy with masking
- Memory tables: ai_user_memory, ai_booking_summaries, ai_equipment_insights, ai_chat_context
- Labour radius search (PostGIS)
- Redis/in-memory caching layer
- Rate limiting for AI queries
- Enterprise features: trust scores, demand prediction, price suggestion
- Test suite for zero hallucination

## Technical Decisions (CONFIRMED)

- Embedding model: **Keep Cloudflare BGE** — free, already working, no migration needed
- Caching: **In-memory only** — enhance existing LRU cache, no Redis
- Queue worker: **Vercel Cron + API route** — poll embedding_queue every 5 min
- Memory tables: **Only ai_chat_context** — rolling conversation summaries
- Test framework: **Bun test** — native to runtime, zero config
- Enterprise features: **Deferred to Phase 2** — focus on core RAG upgrade

## Scope Boundaries

- INCLUDE: Sections 1-10 (minus enterprise features)
  - Database connectivity enhancements + RBAC
  - Embedding pipeline improvements (PII filtering)
  - Hybrid RAG retrieval logic upgrade
  - Anti-hallucination enforcement
  - PII access policy + audit logging
  - ai_chat_context memory table
  - Embedding queue worker (Vercel Cron)
  - Geo-spatial retrieval (labour radius)
  - Context format upgrade (JSON + text)
  - Security & performance (RLS, caching, rate limiting)
  - Test suite for zero hallucination

- EXCLUDE:
  - Embedding model migration (staying with Cloudflare BGE)
  - Redis infrastructure
  - ai_user_memory, ai_booking_summaries, ai_equipment_insights tables
  - Section 11: Enterprise features (trust scores, demand prediction, price suggestion, DevOps AI)
  - DevOps AI assistant
