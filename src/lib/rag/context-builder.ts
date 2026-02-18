import { generateEmbedding } from '@/lib/services/embedding-service';
import { searchKnowledge } from '@/lib/services/knowledge-service';

interface KnowledgeSearchResult {
  source_type: string;
  source_id: string;
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
}

export interface RetrievedContext {
  sourceType: string;
  sourceId: string;
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
}

export interface ContextBuilderResult {
  context: string;
  sources: RetrievedContext[];
  hasContext: boolean;
}

export async function buildRAGContext(
  query: string,
  options?: {
    maxTokens?: number;
    threshold?: number;
    maxResults?: number;
  }
): Promise<ContextBuilderResult> {
  const maxTokens = options?.maxTokens ?? 2000;
  const threshold = options?.threshold ?? 0.7;
  const maxResults = options?.maxResults ?? 10;

  try {
    const embeddingResult = await generateEmbedding(query);
    if (!embeddingResult.success || embeddingResult.embedding.length === 0) {
      return {
        context: '',
        sources: [],
        hasContext: false,
      };
    }
    const searchResults = await searchKnowledge(embeddingResult.embedding, {
      threshold,
      limit: maxResults,
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
    console.error('Error building RAG context:', error);
    return {
      context: '',
      sources: [],
      hasContext: false,
    };
  }
}

export function formatContextForPrompt(contexts: RetrievedContext[]): string {
  if (contexts.length === 0) {
    return '';
  }

  const grouped = groupBySourceType(contexts);
  const sections: string[] = [];

  if (grouped.equipment.length > 0) {
    sections.push(formatEquipmentSection(grouped.equipment));
  }

  if (grouped.labour.length > 0) {
    sections.push(formatLabourSection(grouped.labour));
  }

  if (grouped.user.length > 0) {
    sections.push(formatUserSection(grouped.user));
  }

  if (grouped.review.length > 0) {
    sections.push(formatReviewSection(grouped.review));
  }

  return sections.join('\n\n');
}

function groupBySourceType(contexts: RetrievedContext[]): {
  equipment: RetrievedContext[];
  labour: RetrievedContext[];
  user: RetrievedContext[];
  review: RetrievedContext[];
} {
  return {
    equipment: contexts.filter((c) => c.sourceType === 'equipment'),
    labour: contexts.filter((c) => c.sourceType === 'labour'),
    user: contexts.filter((c) => c.sourceType === 'user'),
    review: contexts.filter((c) => c.sourceType === 'review'),
  };
}

function formatEquipmentSection(contexts: RetrievedContext[]): string {
  const lines: string[] = ['--- EQUIPMENT LISTINGS ---'];

  for (const ctx of contexts) {
    const meta = ctx.metadata;
    const name = String(meta.name ?? 'Unknown Equipment');
    const category = String(meta.category ?? 'Unknown');
    const price = meta.daily_rate != null ? `₹${meta.daily_rate}/day` : 'Price on request';
    const rating =
      meta.avg_rating != null ? `${Number(meta.avg_rating).toFixed(1)}/5` : 'No rating';
    const description = String(meta.description ?? ctx.content ?? '');
    const location = String(meta.location ?? 'Location not specified');
    const available = meta.is_available === true ? 'Yes' : 'No';

    lines.push(`[${name}] (${category}, ${price}, Rating: ${rating})`);
    if (description) {
      lines.push(description);
    }
    lines.push(`Location: ${location}`);
    lines.push(`Available: ${available}`);
    lines.push('');
  }

  return lines.join('\n');
}

function formatLabourSection(contexts: RetrievedContext[]): string {
  const lines: string[] = ['--- LABOUR PROFILES ---'];

  for (const ctx of contexts) {
    const meta = ctx.metadata;
    const name = String(meta.name ?? 'Unknown Worker');
    const skills = Array.isArray(meta.skills)
      ? meta.skills.join(', ')
      : String(meta.skills ?? 'No skills listed');
    const bio = String(meta.bio ?? ctx.content ?? '');
    const rate = meta.daily_rate != null ? `₹${meta.daily_rate}/day` : 'Rate on request';
    const city = String(meta.city ?? meta.location ?? 'Location not specified');
    const availability = String(meta.availability ?? 'Unknown');

    lines.push(`[${name}] (Skills: ${skills})`);
    if (bio) {
      lines.push(bio);
    }
    lines.push(`Rate: ${rate} | Location: ${city}`);
    lines.push(`Availability: ${availability}`);
    lines.push('');
  }

  return lines.join('\n');
}

function formatUserSection(contexts: RetrievedContext[]): string {
  const lines: string[] = ['--- USER PROFILES ---'];

  for (const ctx of contexts) {
    const meta = ctx.metadata;
    const name = String(meta.name ?? meta.full_name ?? 'Unknown User');
    const roles = Array.isArray(meta.roles)
      ? meta.roles.join(', ')
      : String(meta.roles ?? 'No roles');
    const bio = String(meta.bio ?? ctx.content ?? '');
    const address = String(meta.address ?? meta.location ?? 'Location not specified');

    lines.push(`[${name}] (${roles})`);
    if (bio) {
      lines.push(bio);
    }
    lines.push(`Location: ${address}`);
    lines.push('');
  }

  return lines.join('\n');
}

function formatReviewSection(contexts: RetrievedContext[]): string {
  const lines: string[] = ['--- REVIEWS ---'];

  for (const ctx of contexts) {
    const meta = ctx.metadata;
    const equipmentName = String(meta.equipment_name ?? 'Unknown Equipment');
    const reviewerName = String(meta.reviewer_name ?? 'Anonymous');
    const rating = meta.rating != null ? `${meta.rating}/5` : 'No rating';
    const comment = String(meta.comment ?? ctx.content ?? '');

    lines.push(`Review for ${equipmentName} by ${reviewerName}: ${rating}`);
    if (comment) {
      lines.push(comment);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function truncateContext(context: string, maxTokens: number): string {
  const approxChars = maxTokens * 4;

  if (context.length <= approxChars) {
    return context;
  }

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

export function createSourceSummary(contexts: RetrievedContext[]): string {
  if (contexts.length === 0) {
    return 'No relevant context found.';
  }

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
