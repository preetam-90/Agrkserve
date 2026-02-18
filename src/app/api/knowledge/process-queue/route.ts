import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateEmbedding } from '@/lib/services/embedding-service';
import {
  upsertEmbedding,
  deleteEmbedding,
  type KnowledgeEntry,
} from '@/lib/services/knowledge-service';

export const maxDuration = 300;

const BATCH_LIMIT = 100;

function authorize(request: Request): boolean {
  const adminKey = request.headers.get('x-admin-key');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) return false;
  return adminKey === serviceRoleKey;
}

async function fetchAndFormatRecord(
  sourceType: string,
  sourceId: string
): Promise<{ content: string; metadata: Record<string, unknown> } | null> {
  const supabase = createAdminClient();

  switch (sourceType) {
    case 'equipment': {
      const { data, error } = await supabase
        .from('equipment')
        .select(
          'id, name, category, description, brand, price_per_day, location_name, features, owner_id, is_available, rating'
        )
        .eq('id', sourceId)
        .single();

      if (error || !data) return null;

      const parts = [
        data.name,
        data.category || '',
        data.description || '',
        data.brand ? `Brand: ${data.brand}` : '',
        `Price: ₹${data.price_per_day}/day`,
        data.location_name ? `Location: ${data.location_name}` : '',
        data.features?.length ? `Features: ${data.features.join(', ')}` : '',
      ].filter(Boolean);

      return {
        content: parts.join(' - '),
        metadata: {
          id: data.id,
          name: data.name,
          category: data.category,
          price_per_day: data.price_per_day,
          location_name: data.location_name,
          owner_id: data.owner_id,
          is_available: data.is_available,
          rating: data.rating,
        },
      };
    }

    case 'user': {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, name, roles, bio, address, pincode')
        .eq('id', sourceId)
        .single();

      if (error || !data) return null;

      const parts = [
        data.name || 'Unknown User',
        data.roles?.length ? data.roles.join(', ') : '',
        data.bio || '',
        data.address ? `Location: ${data.address}` : '',
        data.pincode || '',
      ].filter(Boolean);

      return {
        content: parts.join(' - '),
        metadata: {
          id: data.id,
          name: data.name,
          roles: data.roles,
          address: data.address,
        },
      };
    }

    case 'labour': {
      const { data, error } = await supabase
        .from('labour_profiles')
        .select(
          `id, skills, bio, daily_rate, location_name, experience_years, availability, average_rating, user_id,
          user_profiles!labour_profiles_user_id_fkey (name)`
        )
        .eq('id', sourceId)
        .single();

      if (error || !data) return null;

      const userProfileArray = data.user_profiles as unknown as { name: string | null }[] | null;
      const userProfile = Array.isArray(userProfileArray) ? userProfileArray[0] : null;

      const parts = [
        userProfile?.name || 'Unknown Labour',
        data.skills?.length ? `Skills: ${data.skills.join(', ')}` : '',
        data.bio || '',
        `Rate: ₹${data.daily_rate}/day`,
        data.location_name ? `Location: ${data.location_name}` : '',
        `Experience: ${data.experience_years} years`,
      ].filter(Boolean);

      return {
        content: parts.join(' - '),
        metadata: {
          id: data.id,
          skills: data.skills,
          daily_rate: data.daily_rate,
          location_name: data.location_name,
          availability: data.availability,
          rating: data.average_rating,
        },
      };
    }

    case 'review': {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, equipment_id, rating, comment, reviewer_id')
        .eq('id', sourceId)
        .single();

      if (error || !data) return null;

      const { data: equipmentData } = await supabase
        .from('equipment')
        .select('name')
        .eq('id', data.equipment_id)
        .single();

      const { data: reviewerData } = await supabase
        .from('user_profiles')
        .select('name')
        .eq('id', data.reviewer_id)
        .single();

      const equipmentName = equipmentData?.name || 'Unknown Equipment';
      const reviewerName = reviewerData?.name || 'Anonymous';

      const parts = [
        `${equipmentName} review by ${reviewerName}`,
        data.comment || '',
        `Rating: ${data.rating}/5`,
      ].filter(Boolean);

      return {
        content: parts.join(': '),
        metadata: {
          id: data.id,
          equipment_id: data.equipment_id,
          equipment_name: equipmentData?.name || null,
          rating: data.rating,
          reviewer_name: reviewerData?.name || null,
        },
      };
    }

    default:
      return null;
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'embedding-queue-processor',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: invalid or missing x-admin-key header' },
      { status: 401 }
    );
  }

  const supabase = createAdminClient();
  const results = {
    processed: 0,
    deleted: 0,
    upserted: 0,
    errors: [] as string[],
    skipped: 0,
  };

  try {
    // Fetch unprocessed queue items, oldest first
    const { data: queueItems, error: fetchError } = await supabase
      .from('embedding_queue')
      .select('id, source_type, source_id, action, created_at')
      .eq('processed', false)
      .order('created_at', { ascending: true })
      .limit(BATCH_LIMIT);

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: `Failed to fetch queue: ${fetchError.message}` },
        { status: 500 }
      );
    }

    if (!queueItems || queueItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No items in queue',
        results,
      });
    }

    for (const item of queueItems) {
      try {
        if (item.action === 'delete') {
          await deleteEmbedding(item.source_type, item.source_id);
          results.deleted++;
        } else {
          // insert or update
          const record = await fetchAndFormatRecord(item.source_type, item.source_id);

          if (!record) {
            // Record may have been deleted after the queue entry was created
            results.skipped++;
            // Still mark as processed
            await supabase.from('embedding_queue').update({ processed: true }).eq('id', item.id);
            results.processed++;
            continue;
          }

          const embeddingResult = await generateEmbedding(record.content);

          if (!embeddingResult.success || embeddingResult.embedding.length === 0) {
            results.errors.push(
              `Failed to generate embedding for ${item.source_type}/${item.source_id}: ${embeddingResult.error}`
            );
            continue;
          }

          await upsertEmbedding(
            {
              source_type: item.source_type as KnowledgeEntry['source_type'],
              source_id: item.source_id,
              content: record.content,
              metadata: record.metadata,
            },
            embeddingResult.embedding
          );

          results.upserted++;
        }

        // Mark as processed
        await supabase.from('embedding_queue').update({ processed: true }).eq('id', item.id);

        results.processed++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        results.errors.push(
          `Error processing ${item.source_type}/${item.source_id} (${item.action}): ${errorMsg}`
        );
      }
    }

    return NextResponse.json({
      success: results.errors.length === 0,
      results,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Queue processing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during queue processing',
        details: error instanceof Error ? error.message : String(error),
        results,
      },
      { status: 500 }
    );
  }
}
