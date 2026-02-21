import { createAdminClient } from '@/lib/supabase/admin';
import { generateEmbedding } from '@/lib/services/embedding-service';

export type PlatformCategory =
  | 'platform_info'
  | 'founder'
  | 'mission'
  | 'legal'
  | 'faq'
  | 'policy'
  | 'metadata';

export type DocumentType =
  | 'privacy_policy'
  | 'terms_of_service'
  | 'terms_and_conditions'
  | 'legal_disclaimer'
  | 'platform_rules'
  | 'faq_detailed'
  | 'policy_detailed'
  | 'about_platform'
  | 'founder_story';

export interface PlatformKnowledgeEntry {
  category: PlatformCategory;
  key: string;
  data: Record<string, unknown>;
  description?: string;
  is_active?: boolean;
  version?: string;
}

export interface PlatformDocumentEntry {
  document_type: DocumentType;
  title: string;
  content: string;
  chunk_index?: number;
  metadata?: Record<string, unknown>;
  version?: string;
  is_active?: boolean;
  embedding?: number[];
}

export interface PlatformFact {
  category: string;
  key: string;
  data: Record<string, unknown>;
  description?: string;
}

interface PlatformKnowledgeRow {
  id: string;
  category: PlatformCategory;
  key: string;
  data: Record<string, unknown>;
  description?: string;
  is_active: boolean;
  version: string;
  created_at: string;
  updated_at: string;
}

interface PlatformDocumentRow {
  id: string;
  document_type: DocumentType;
  title: string;
  content: string;
  chunk_index: number;
  metadata?: Record<string, unknown>;
  version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PlatformDocumentSearchResult {
  id: string;
  document_type: string;
  title: string;
  content: string;
  chunk_index: number;
  metadata?: Record<string, unknown>;
  similarity: number;
}

export async function upsertPlatformKnowledge(
  entry: PlatformKnowledgeEntry
): Promise<{ success: boolean; error?: string; data?: PlatformKnowledgeRow }> {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase
      .from('platform_knowledge')
      .upsert(
        {
          category: entry.category,
          key: entry.key,
          data: entry.data,
          description: entry.description,
          is_active: entry.is_active ?? true,
          version: entry.version ?? '1.0.0',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'category,key' }
      )
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function getPlatformKnowledge(
  category?: PlatformCategory,
  key?: string,
  activeOnly: boolean = true
): Promise<PlatformFact[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from('platform_knowledge')
    .select('id, category, key, data, description, version, updated_at, is_active, created_at')
    .order('category, key');

  if (category) query = query.eq('category', category);
  if (key) query = query.eq('key', key);
  if (activeOnly) query = query.eq('is_active', true);

  const { data, error } = await query;
  if (error) {
    console.error('[platform-knowledge-service] Error fetching knowledge:', error.message);
    return [];
  }

  return (
    data?.map((row: PlatformKnowledgeRow) => ({
      category: row.category,
      key: row.key,
      data: row.data as Record<string, unknown>,
      description: row.description,
    })) || []
  );
}

export async function getAllPlatformFacts(
  activeOnly: boolean = true
): Promise<Record<string, Record<string, unknown>>> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc('get_all_platform_facts', {
    p_active_only: activeOnly,
  });

  if (error) {
    console.error('[platform-knowledge-service] Error getting all facts:', error.message);
    return {};
  }

  return (data as Record<string, Record<string, unknown>>) || {};
}

export async function deletePlatformKnowledge(
  category: PlatformCategory,
  key: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  try {
    await supabase.from('platform_knowledge').delete().eq('category', category).eq('key', key);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function upsertPlatformDocument(
  entry: PlatformDocumentEntry
): Promise<{ success: boolean; error?: string; data?: PlatformDocumentRow }> {
  const supabase = createAdminClient();

  try {
    let embedding = entry.embedding;
    if (entry.content && (!embedding || embedding.length === 0)) {
      const result = await generateEmbedding(entry.content);
      if (!result.success) {
        console.warn('[platform-knowledge-service] Failed to generate embedding:', result.error);
        embedding = undefined;
      } else {
        embedding = result.embedding;
      }
    }

    const { data, error } = await supabase
      .from('platform_documents')
      .upsert(
        {
          document_type: entry.document_type,
          title: entry.title,
          content: entry.content,
          chunk_index: entry.chunk_index ?? 0,
          embedding,
          metadata: entry.metadata ?? {},
          version: entry.version ?? '1.0.0',
          is_active: entry.is_active ?? true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'document_type,title,chunk_index' }
      )
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function getPlatformDocuments(
  documentType?: DocumentType,
  activeOnly: boolean = true
): Promise<PlatformDocumentRow[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from('platform_documents')
    .select(
      'id, document_type, title, content, chunk_index, metadata, version, created_at, is_active, updated_at'
    )
    .order('document_type, title, chunk_index');

  if (documentType) query = query.eq('document_type', documentType);
  if (activeOnly) query = query.eq('is_active', true);

  const { data, error } = await query;
  if (error) {
    console.error('[platform-knowledge-service] Error fetching documents:', error.message);
    return [];
  }

  return data || [];
}

export async function searchPlatformDocuments(
  query: string,
  threshold: number = 0.7,
  limit: number = 5,
  documentTypes?: DocumentType[]
): Promise<
  Array<{
    id: string;
    document_type: string;
    title: string;
    content: string;
    chunk_index: number;
    metadata: Record<string, unknown>;
    similarity: number;
  }>
> {
  const supabase = createAdminClient();

  const embeddingResult = await generateEmbedding(query);
  if (!embeddingResult.success || embeddingResult.embedding.length === 0) {
    console.error(
      '[platform-knowledge-service] Failed to generate query embedding:',
      embeddingResult.error
    );
    return [];
  }

  const { data, error } = await supabase.rpc('search_platform_documents', {
    query_embedding: embeddingResult.embedding,
    match_threshold: threshold,
    match_count: limit,
    filter_document_types: documentTypes,
  });

  if (error) {
    console.error('[platform-knowledge-service] Error searching documents:', error.message);
    return [];
  }

  return (
    data?.map((row: PlatformDocumentSearchResult) => ({
      id: row.id,
      document_type: row.document_type,
      title: row.title,
      content: row.content,
      chunk_index: row.chunk_index,
      metadata: row.metadata as Record<string, unknown>,
      similarity: row.similarity,
    })) || []
  );
}

export async function deletePlatformDocument(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  try {
    await supabase.from('platform_documents').delete().eq('id', id);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export interface PlatformKnowledgeContext {
  structuredFacts: Record<string, Record<string, unknown>>;
  documentMatches: Array<{
    title: string;
    document_type: string;
    content: string;
    similarity: number;
  }>;
}

export async function buildPlatformKnowledgeContext(
  query?: string,
  documentThreshold: number = 0.7,
  documentLimit: number = 3
): Promise<PlatformKnowledgeContext> {
  const structuredFacts = await getAllPlatformFacts(true);
  let documentMatches: PlatformKnowledgeContext['documentMatches'] = [];

  if (query) {
    const searchResults = await searchPlatformDocuments(query, documentThreshold, documentLimit);
    documentMatches = searchResults.map((r) => ({
      title: r.title,
      document_type: r.document_type,
      content: r.content,
      similarity: r.similarity,
    }));
  }

  return { structuredFacts, documentMatches };
}

function formatValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map((v) => `\n  - ${String(v)}`).join('');
  if (typeof value === 'object' && value !== null) {
    // Flatten one level deep
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => {
        const label = k
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        return `\n  - **${label}**: ${String(v)}`;
      })
      .join('');
  }
  return String(value);
}

export function formatPlatformFactsForPrompt(
  facts: Record<string, Record<string, unknown>>
): string {
  if (Object.keys(facts).length === 0) {
    return 'No platform knowledge available.';
  }

  const sections: string[] = [];

  for (const [category, keys] of Object.entries(facts)) {
    const categoryTitle = category
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    sections.push(`### ${categoryTitle}`);

    for (const [key, value] of Object.entries(keys as Record<string, unknown>)) {
      // For nested objects (e.g. founder_details, platform_metadata), expand their fields directly
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        for (const [subKey, subVal] of Object.entries(value as Record<string, unknown>)) {
          const label = subKey
            .split('_')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          sections.push(`**${label}**: ${formatValue(subVal)}`);
        }
      } else {
        const formattedKey = key
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        sections.push(`**${formattedKey}**: ${formatValue(value)}`);
      }
    }
    sections.push('');
  }

  return sections.join('\n');
}

