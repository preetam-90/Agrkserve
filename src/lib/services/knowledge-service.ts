import { createAdminClient } from '@/lib/supabase/admin';
import { generateEmbedding, EMBEDDING_DIMENSIONS } from './embedding-service';

interface KnowledgeEntry {
  source_type: 'equipment' | 'user' | 'labour' | 'review' | 'booking';
  source_id: string;
  content: string;
  metadata: Record<string, unknown>;
}

const BATCH_SIZE = 50;

function formatEquipmentContent(equipment: {
  name: string;
  category: string | null;
  description: string | null;
  brand: string | null;
  price_per_day: number;
  location_name: string | null;
  features: string[] | null;
}): string {
  const parts = [
    equipment.name,
    equipment.category || '',
    equipment.description || '',
    equipment.brand ? `Brand: ${equipment.brand}` : '',
    `Price: ₹${equipment.price_per_day}/day`,
    equipment.location_name ? `Location: ${equipment.location_name}` : '',
    equipment.features?.length ? `Features: ${equipment.features.join(', ')}` : '',
  ].filter(Boolean);
  return parts.join(' - ');
}

function formatUserContent(user: {
  name: string | null;
  roles: string[] | null;
  bio: string | null;
  address: string | null;
  pincode: string | null;
}): string {
  const parts = [
    user.name || 'Unknown User',
    user.roles?.length ? user.roles.join(', ') : '',
    user.bio || '',
    user.address ? `Location: ${user.address}` : '',
    user.pincode || '',
  ].filter(Boolean);
  return parts.join(' - ');
}

function formatLabourContent(labour: {
  user?: { name: string | null } | null;
  skills: string[];
  bio: string | null;
  daily_rate: number;
  location_name: string | null;
  experience_years: number;
}): string {
  const parts = [
    labour.user?.name || 'Unknown Labour',
    labour.skills.length ? `Skills: ${labour.skills.join(', ')}` : '',
    labour.bio || '',
    `Rate: ₹${labour.daily_rate}/day`,
    labour.location_name ? `Location: ${labour.location_name}` : '',
    `Experience: ${labour.experience_years} years`,
  ].filter(Boolean);
  return parts.join(' - ');
}

function formatReviewContent(review: {
  equipment?: { name: string | null } | null;
  reviewer?: { name: string | null } | null;
  comment: string | null;
  rating: number;
}): string {
  const equipmentName = review.equipment?.name || 'Unknown Equipment';
  const reviewerName = review.reviewer?.name || 'Anonymous';
  const parts = [
    `${equipmentName} review by ${reviewerName}`,
    review.comment || '',
    `Rating: ${review.rating}/5`,
  ].filter(Boolean);
  return parts.join(': ');
}

export async function syncEquipment(since?: Date): Promise<{ synced: number; errors: string[] }> {
  const supabase = createAdminClient();
  const errors: string[] = [];
  let synced = 0;

  let query = supabase
    .from('equipment')
    .select(
      'id, name, category, description, brand, price_per_day, location_name, features, owner_id, is_available, rating, updated_at'
    );

  if (since) {
    query = query.gte('updated_at', since.toISOString());
  }

  const { data: equipment, error: fetchError } = await query;

  if (fetchError) {
    errors.push(`Failed to fetch equipment: ${fetchError.message}`);
    return { synced, errors };
  }

  if (!equipment || equipment.length === 0) {
    return { synced, errors };
  }

  for (let i = 0; i < equipment.length; i += BATCH_SIZE) {
    const batch = equipment.slice(i, i + BATCH_SIZE);

    for (const item of batch) {
      try {
        const content = formatEquipmentContent(item);
        const embeddingResult = await generateEmbedding(content);

        if (!embeddingResult.success || embeddingResult.embedding.length === 0) {
          errors.push(
            `Failed to generate embedding for equipment ${item.id}: ${embeddingResult.error}`
          );
          continue;
        }

        const entry: KnowledgeEntry = {
          source_type: 'equipment',
          source_id: item.id,
          content,
          metadata: {
            id: item.id,
            name: item.name,
            category: item.category,
            price_per_day: item.price_per_day,
            location_name: item.location_name,
            owner_id: item.owner_id,
            is_available: item.is_available,
            rating: item.rating,
          },
        };

        await upsertEmbedding(entry, embeddingResult.embedding);
        synced++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        errors.push(`Error syncing equipment ${item.id}: ${errorMsg}`);
      }
    }
  }

  return { synced, errors };
}

export async function syncUsers(since?: Date): Promise<{ synced: number; errors: string[] }> {
  const supabase = createAdminClient();
  const errors: string[] = [];
  let synced = 0;

  let query = supabase
    .from('user_profiles')
    .select('id, name, roles, bio, address, pincode, updated_at');

  if (since) {
    query = query.gte('updated_at', since.toISOString());
  }

  const { data: users, error: fetchError } = await query;

  if (fetchError) {
    errors.push(`Failed to fetch users: ${fetchError.message}`);
    return { synced, errors };
  }

  if (!users || users.length === 0) {
    return { synced, errors };
  }

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);

    for (const user of batch) {
      try {
        const content = formatUserContent(user);
        const embeddingResult = await generateEmbedding(content);

        if (!embeddingResult.success || embeddingResult.embedding.length === 0) {
          errors.push(`Failed to generate embedding for user ${user.id}: ${embeddingResult.error}`);
          continue;
        }

        const entry: KnowledgeEntry = {
          source_type: 'user',
          source_id: user.id,
          content,
          metadata: {
            id: user.id,
            name: user.name,
            roles: user.roles,
            address: user.address,
          },
        };

        await upsertEmbedding(entry, embeddingResult.embedding);
        synced++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        errors.push(`Error syncing user ${user.id}: ${errorMsg}`);
      }
    }
  }

  return { synced, errors };
}

export async function syncLabour(since?: Date): Promise<{ synced: number; errors: string[] }> {
  const supabase = createAdminClient();
  const errors: string[] = [];
  let synced = 0;

  let query = supabase.from('labour_profiles').select(`
      id,
      skills,
      bio,
      daily_rate,
      location_name,
      experience_years,
      availability,
      average_rating,
      user_id,
      updated_at,
      user_profiles!labour_profiles_user_id_fkey (name)
    `);

  if (since) {
    query = query.gte('updated_at', since.toISOString());
  }

  const { data: labourProfiles, error: fetchError } = await query;

  if (fetchError) {
    errors.push(`Failed to fetch labour profiles: ${fetchError.message}`);
    return { synced, errors };
  }

  if (!labourProfiles || labourProfiles.length === 0) {
    return { synced, errors };
  }

  for (let i = 0; i < labourProfiles.length; i += BATCH_SIZE) {
    const batch = labourProfiles.slice(i, i + BATCH_SIZE);

    for (const labour of batch) {
      try {
        const userProfileArray = labour.user_profiles as unknown as
          | { name: string | null }[]
          | null;
        const userProfile = Array.isArray(userProfileArray) ? userProfileArray[0] : null;
        const content = formatLabourContent({
          user: { name: userProfile?.name || null },
          skills: labour.skills,
          bio: labour.bio,
          daily_rate: labour.daily_rate,
          location_name: labour.location_name,
          experience_years: labour.experience_years,
        });

        const embeddingResult = await generateEmbedding(content);

        if (!embeddingResult.success || embeddingResult.embedding.length === 0) {
          errors.push(
            `Failed to generate embedding for labour ${labour.id}: ${embeddingResult.error}`
          );
          continue;
        }

        const entry: KnowledgeEntry = {
          source_type: 'labour',
          source_id: labour.id,
          content,
          metadata: {
            id: labour.id,
            skills: labour.skills,
            daily_rate: labour.daily_rate,
            location_name: labour.location_name,
            availability: labour.availability,
            rating: labour.average_rating,
          },
        };

        await upsertEmbedding(entry, embeddingResult.embedding);
        synced++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        errors.push(`Error syncing labour ${labour.id}: ${errorMsg}`);
      }
    }
  }

  return { synced, errors };
}

export async function syncReviews(since?: Date): Promise<{ synced: number; errors: string[] }> {
  const supabase = createAdminClient();
  const errors: string[] = [];
  let synced = 0;

  let query = supabase.from('reviews').select(`
      id,
      equipment_id,
      rating,
      comment,
      reviewer_id,
      updated_at
    `);

  if (since) {
    query = query.gte('updated_at', since.toISOString());
  }

  const { data: reviews, error: fetchError } = await query;

  if (fetchError) {
    errors.push(`Failed to fetch reviews: ${fetchError.message}`);
    return { synced, errors };
  }

  if (!reviews || reviews.length === 0) {
    return { synced, errors };
  }

  for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
    const batch = reviews.slice(i, i + BATCH_SIZE);

    for (const review of batch) {
      try {
        // Fetch equipment name separately
        const { data: equipmentData } = await supabase
          .from('equipment')
          .select('name')
          .eq('id', review.equipment_id)
          .single();

        // Fetch reviewer name separately (user_profiles.id = auth.users.id)
        const { data: reviewerData } = await supabase
          .from('user_profiles')
          .select('name')
          .eq('id', review.reviewer_id)
          .single();

        const content = formatReviewContent({
          equipment: { name: equipmentData?.name || null },
          reviewer: { name: reviewerData?.name || null },
          comment: review.comment,
          rating: review.rating,
        });

        const embeddingResult = await generateEmbedding(content);

        if (!embeddingResult.success || embeddingResult.embedding.length === 0) {
          errors.push(
            `Failed to generate embedding for review ${review.id}: ${embeddingResult.error}`
          );
          continue;
        }

        const entry: KnowledgeEntry = {
          source_type: 'review',
          source_id: review.id,
          content,
          metadata: {
            id: review.id,
            equipment_id: review.equipment_id,
            equipment_name: equipmentData?.name || null,
            rating: review.rating,
            reviewer_name: reviewerData?.name || null,
          },
        };

        await upsertEmbedding(entry, embeddingResult.embedding);
        synced++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        errors.push(`Error syncing review ${review.id}: ${errorMsg}`);
      }
    }
  }

  return { synced, errors };
}

export async function syncAllKnowledge(): Promise<{
  equipment: { synced: number; errors: string[] };
  users: { synced: number; errors: string[] };
  labour: { synced: number; errors: string[] };
  reviews: { synced: number; errors: string[] };
}> {
  const [equipment, users, labour, reviews] = await Promise.all([
    syncEquipment(),
    syncUsers(),
    syncLabour(),
    syncReviews(),
  ]);

  return { equipment, users, labour, reviews };
}

export async function searchKnowledge(
  queryEmbedding: number[],
  options?: { threshold?: number; limit?: number; sourceTypes?: string[] }
): Promise<
  Array<{
    id: string;
    source_type: string;
    source_id: string;
    content: string;
    metadata: Record<string, unknown>;
    similarity: number;
  }>
> {
  const supabase = createAdminClient();
  const threshold = options?.threshold ?? 0.7;
  const limit = options?.limit ?? 10;
  const sourceTypes = options?.sourceTypes;

  const { data, error } = await supabase.rpc('search_knowledge_embeddings', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: limit,
    filter_source_types: sourceTypes,
  });

  if (error) {
    throw new Error(`Failed to search knowledge: ${error.message}`);
  }

  return (data || []).map(
    (item: {
      id: string;
      source_type: string;
      source_id: string;
      content: string;
      metadata: Record<string, unknown>;
      similarity: number;
    }) => ({
      id: item.id,
      source_type: item.source_type,
      source_id: item.source_id,
      content: item.content,
      metadata: item.metadata,
      similarity: item.similarity,
    })
  );
}

export async function deleteEmbedding(sourceType: string, sourceId: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('knowledge_embeddings')
    .delete()
    .eq('source_type', sourceType)
    .eq('source_id', sourceId);

  if (error) {
    throw new Error(`Failed to delete embedding: ${error.message}`);
  }
}

export async function upsertEmbedding(entry: KnowledgeEntry, embedding: number[]): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.from('knowledge_embeddings').upsert(
    {
      source_type: entry.source_type,
      source_id: entry.source_id,
      content: entry.content,
      metadata: entry.metadata,
      embedding,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'source_type,source_id',
    }
  );

  if (error) {
    throw new Error(`Failed to upsert embedding: ${error.message}`);
  }
}

export { EMBEDDING_DIMENSIONS };
export type { KnowledgeEntry };
