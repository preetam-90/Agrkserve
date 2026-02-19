/**
 * RAG Context Builder
 *
 * Builds structured context strings from vector search results to inject
 * into the LLM system prompt. Each section is formatted per source type
 * using metadata stored alongside the embeddings in knowledge_embeddings.
 *
 * Metadata field reference (must match knowledge-service.ts):
 *   equipment : { id, name, category, price_per_day, location_name, owner_id, is_available, rating }
 *   labour    : { id, skills, daily_rate, location_name, availability, rating }
 *   user      : { id, name, roles, address }
 *   review    : { id, equipment_id, equipment_name, rating, reviewer_name }
 *   booking   : { id, equipment_id, equipment_name, renter_id, renter_name,
 *                 status, start_date, end_date, total_days, total_amount, payment_status }
 */

import { generateEmbedding } from '@/lib/services/embedding-service';
import { searchKnowledge } from '@/lib/services/knowledge-service';

// ─── Types ───────────────────────────────────────────────────────────────────

interface KnowledgeSearchResult {
  source_type: string;
  source_id: string;
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
}

interface RetrievedContext {
  sourceType: string;
  sourceId: string;
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
}

interface ContextBuilderResult {
  context: string;
  sources: RetrievedContext[];
  hasContext: boolean;
}

// ─── Main API ─────────────────────────────────────────────────────────────────

/**
 * Generates a query embedding, performs vector similarity search, and returns
 * a formatted context string ready to be injected into the LLM prompt.
 *
 * @param query     The user's natural-language query
 * @param options   Optional overrides for threshold, result count, and token limit
 */
export async function buildRAGContext(
  query: string,
  options?: {
    maxTokens?: number;
    threshold?: number;
    maxResults?: number;
    sourceTypes?: string[];
  }
): Promise<ContextBuilderResult> {
  const maxTokens = options?.maxTokens ?? 2000;
  const threshold = options?.threshold ?? 0.5;
  const maxResults = options?.maxResults ?? 10;
  const sourceTypes = options?.sourceTypes;

  try {
    const embeddingResult = await generateEmbedding(query);
    if (!embeddingResult.success || embeddingResult.embedding.length === 0) {
      return { context: '', sources: [], hasContext: false };
    }

    const searchResults = await searchKnowledge(embeddingResult.embedding, {
      threshold,
      limit: maxResults,
      sourceTypes,
    });

    const contexts: RetrievedContext[] = searchResults.map((result: KnowledgeSearchResult) => ({
      sourceType: result.source_type,
      sourceId: result.source_id,
      content: result.content,
      similarity: result.similarity,
      metadata: result.metadata,
    }));

    let formattedContext = formatContextForPrompt(contexts);
    formattedContext = truncateContext(formattedContext, maxTokens);

    return {
      context: formattedContext,
      sources: contexts,
      hasContext: contexts.length > 0,
    };
  } catch (error) {
    console.error('[context-builder] Error building RAG context:', error);
    return { context: '', sources: [], hasContext: false };
  }
}

// ─── Formatting ───────────────────────────────────────────────────────────────

/**
 * Groups retrieved contexts by source type and formats each group into a
 * markdown-style section for the LLM system prompt.
 */
export function formatContextForPrompt(contexts: RetrievedContext[]): string {
  if (contexts.length === 0) return '';

  const grouped = groupBySourceType(contexts);
  const sections: string[] = [];

  if (grouped.equipment.length > 0) sections.push(formatEquipmentSection(grouped.equipment));
  if (grouped.labour.length > 0) sections.push(formatLabourSection(grouped.labour));
  if (grouped.user.length > 0) sections.push(formatUserSection(grouped.user));
  if (grouped.review.length > 0) sections.push(formatReviewSection(grouped.review));
  if (grouped.booking.length > 0) sections.push(formatBookingSection(grouped.booking));

  return sections.join('\n\n');
}

function groupBySourceType(contexts: RetrievedContext[]): {
  equipment: RetrievedContext[];
  labour: RetrievedContext[];
  user: RetrievedContext[];
  review: RetrievedContext[];
  booking: RetrievedContext[];
} {
  return {
    equipment: contexts.filter((c) => c.sourceType === 'equipment'),
    labour: contexts.filter((c) => c.sourceType === 'labour'),
    user: contexts.filter((c) => c.sourceType === 'user'),
    review: contexts.filter((c) => c.sourceType === 'review'),
    booking: contexts.filter((c) => c.sourceType === 'booking'),
  };
}

/**
 * Equipment section.
 * Metadata keys: name, category, price_per_day, location_name, is_available, rating
 */
function formatEquipmentSection(contexts: RetrievedContext[]): string {
  const lines: string[] = ['--- EQUIPMENT LISTINGS ---'];

  for (const ctx of contexts) {
    const meta = ctx.metadata;
    const name = String(meta.name ?? 'Unknown Equipment');
    const category = String(meta.category ?? 'Unknown');
    // price_per_day is the correct field (NOT daily_rate)
    const price = meta.price_per_day != null ? `₹${meta.price_per_day}/day` : 'Price on request';
    // rating is the correct field (NOT avg_rating)
    const rating = meta.rating != null ? `${Number(meta.rating).toFixed(1)}/5` : 'No rating';
    // location_name is the correct field (NOT location)
    const location = String(meta.location_name ?? 'Location not specified');
    const available = meta.is_available === true ? 'Yes' : 'No';
    // Description is not in metadata; use the embedded content text
    const description = ctx.content;

    lines.push(`[${name}] (${category}, ${price}, Rating: ${rating})`);
    if (description) lines.push(description);
    lines.push(`Location: ${location} | Available: ${available}`);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Labour section.
 * Metadata keys: id, skills, daily_rate, location_name, availability, rating
 * Note: 'name' is NOT stored in labour metadata — extract from content text.
 */
function formatLabourSection(contexts: RetrievedContext[]): string {
  const lines: string[] = ['--- LABOUR PROFILES ---'];

  for (const ctx of contexts) {
    const meta = ctx.metadata;
    const skills = Array.isArray(meta.skills)
      ? meta.skills.join(', ')
      : String(meta.skills ?? 'No skills listed');
    // daily_rate is correct for labour (same field name as in DB)
    const rate = meta.daily_rate != null ? `₹${meta.daily_rate}/day` : 'Rate on request';
    // location_name is the correct field (NOT city or location)
    const location = String(meta.location_name ?? 'Location not specified');
    const availability = String(meta.availability ?? 'Unknown');
    const rating = meta.rating != null ? `${Number(meta.rating).toFixed(1)}/5` : 'No rating';

    // Name is embedded in the content text (first segment before ' - ')
    lines.push(`[Skills: ${skills}]`);
    lines.push(`Rate: ${rate} | Location: ${location}`);
    lines.push(`Availability: ${availability} | Rating: ${rating}`);
    // Include the full content for name + bio context
    if (ctx.content) lines.push(ctx.content.slice(0, 250));
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * User section.
 * Metadata keys: id, name, roles, address
 */
function formatUserSection(contexts: RetrievedContext[]): string {
  const lines: string[] = ['--- USER PROFILES ---'];

  for (const ctx of contexts) {
    const meta = ctx.metadata;
    const name = String(meta.name ?? meta.full_name ?? 'Unknown User');
    const roles = Array.isArray(meta.roles)
      ? meta.roles.join(', ')
      : String(meta.roles ?? 'No roles');
    // address is the correct field (NOT location)
    const address = String(meta.address ?? 'Location not specified');

    lines.push(`[${name}] (${roles})`);
    lines.push(`Location: ${address}`);
    if (ctx.content) lines.push(ctx.content.slice(0, 200));
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Review section.
 * Metadata keys: id, equipment_id, equipment_name, rating, reviewer_name
 */
function formatReviewSection(contexts: RetrievedContext[]): string {
  const lines: string[] = ['--- REVIEWS ---'];

  for (const ctx of contexts) {
    const meta = ctx.metadata;
    const equipmentName = String(meta.equipment_name ?? 'Unknown Equipment');
    const reviewerName = String(meta.reviewer_name ?? 'Anonymous');
    const rating = meta.rating != null ? `${meta.rating}/5` : 'No rating';
    const comment = ctx.content;

    lines.push(`Review for ${equipmentName} by ${reviewerName}: ${rating}`);
    if (comment) lines.push(comment);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Booking section (NEW).
 * Metadata keys: id, equipment_id, equipment_name, renter_id, renter_name,
 *                status, start_date, end_date, total_days, total_amount, payment_status
 */
function formatBookingSection(contexts: RetrievedContext[]): string {
  const lines: string[] = ['--- BOOKINGS ---'];

  for (const ctx of contexts) {
    const meta = ctx.metadata;
    const equipment = String(meta.equipment_name ?? 'Unknown Equipment');
    const renter = String(meta.renter_name ?? 'Unknown Renter');
    const status = String(meta.status ?? 'Unknown');
    const startDate = String(meta.start_date ?? 'N/A');
    const endDate = String(meta.end_date ?? 'N/A');
    const days = meta.total_days != null ? `${meta.total_days} day(s)` : '';
    const amount = meta.total_amount != null ? `₹${meta.total_amount}` : 'N/A';
    const paymentStatus = String(meta.payment_status ?? 'N/A');

    lines.push(`[Booking: ${equipment} rented by ${renter}]`);
    lines.push(`Status: ${status} | Dates: ${startDate} → ${endDate}${days ? ` (${days})` : ''}`);
    lines.push(`Amount: ${amount} | Payment: ${paymentStatus}`);
    lines.push('');
  }

  return lines.join('\n');
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Truncates the context string to approximately maxTokens tokens.
 * Prefers breaking at section boundaries (--- headers) to preserve coherence.
 */
function truncateContext(context: string, maxTokens: number): string {
  // Rough estimate: 1 token ≈ 4 characters
  const approxChars = maxTokens * 4;

  if (context.length <= approxChars) return context;

  let truncated = context.substring(0, approxChars);

  const lastSectionBreak = truncated.lastIndexOf('\n\n---');
  if (lastSectionBreak > approxChars * 0.7) {
    truncated = truncated.substring(0, lastSectionBreak);
  } else {
    const lastNewline = truncated.lastIndexOf('\n');
    if (lastNewline > approxChars * 0.8) {
      truncated = truncated.substring(0, lastNewline);
    }
  }

  return truncated + '\n\n[Context truncated due to length limits]';
}

/**
 * Generates a human-readable summary of what was retrieved.
 * Useful for logging and transparency in the chat UI.
 */
function createSourceSummary(contexts: RetrievedContext[]): string {
  if (contexts.length === 0) return 'No relevant context found.';

  const counts: Record<string, number> = {};
  for (const ctx of contexts) {
    counts[ctx.sourceType] = (counts[ctx.sourceType] ?? 0) + 1;
  }

  const parts: string[] = [];
  for (const [type, count] of Object.entries(counts)) {
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    parts.push(`${count} ${label}${count > 1 ? 's' : ''}`);
  }

  return `Found ${contexts.length} relevant result${contexts.length > 1 ? 's' : ''}: ${parts.join(', ')}`;
}
