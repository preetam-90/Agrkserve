import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateEmbedding } from '@/lib/services/embedding-service';
import {
  upsertEmbedding,
  deleteEmbedding,
  type KnowledgeEntry,
} from '@/lib/services/knowledge-service';

export const maxDuration = 60;

type WebhookPayload = {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: Record<string, unknown> | null;
  old_record: Record<string, unknown> | null;
};

/**
 * Maps Supabase table names to knowledge_embeddings source_type values.
 * Must match the CHECK constraint in migration 028_pgvector_rag_setup.sql.
 */
const TABLE_SOURCE_MAP: Record<string, KnowledgeEntry['source_type']> = {
  equipment: 'equipment',
  user_profiles: 'user',
  labour_profiles: 'labour',
  reviews: 'review',
  bookings: 'booking',
};

function authorize(request: Request): boolean {
  const webhookSecret = request.headers.get('x-webhook-secret');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) return false;
  return webhookSecret === serviceRoleKey;
}

function getRecordId(payload: WebhookPayload): string | null {
  const record = payload.type === 'DELETE' ? payload.old_record : payload.record;
  if (!record || !record.id) return null;
  return String(record.id);
}

async function fetchAndFormatContent(
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

    case 'booking': {
      const { data, error } = await supabase
        .from('bookings')
        .select(
          'id, equipment_id, renter_id, start_date, end_date, total_days, price_per_day, total_amount, status'
        )
        .eq('id', sourceId)
        .single();

      if (error || !data) return null;

      // Fetch related entities in parallel
      const [equipRes, renterRes, paymentRes] = await Promise.all([
        data.equipment_id
          ? supabase.from('equipment').select('name').eq('id', data.equipment_id).single()
          : Promise.resolve({ data: null }),
        data.renter_id
          ? supabase.from('user_profiles').select('name').eq('id', data.renter_id).single()
          : Promise.resolve({ data: null }),
        supabase
          .from('payments')
          .select('status')
          .eq('booking_id', sourceId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const equipmentName = equipRes.data?.name || 'Unknown Equipment';
      const renterName = renterRes.data?.name || 'Unknown Renter';
      const paymentStatus = paymentRes.data?.status || null;

      const dateRange =
        data.start_date && data.end_date ? `from ${data.start_date} to ${data.end_date}` : '';
      const days = data.total_days != null ? `${data.total_days} days` : '';
      const amount = data.total_amount != null ? `₹${data.total_amount}` : 'amount TBD';
      const paymentStr = paymentStatus ? `Payment: ${paymentStatus}` : '';

      const parts = [
        `Booking for ${equipmentName} by ${renterName}`,
        `Status: ${data.status}`,
        dateRange,
        days,
        amount,
        paymentStr,
      ].filter(Boolean);

      return {
        content: parts.join(' - '),
        metadata: {
          id: data.id,
          equipment_id: data.equipment_id,
          equipment_name: equipmentName,
          renter_id: data.renter_id,
          renter_name: renterName,
          status: data.status,
          start_date: data.start_date,
          end_date: data.end_date,
          total_days: data.total_days,
          total_amount: data.total_amount,
          payment_status: paymentStatus,
        },
      };
    }

    default:
      return null;
  }
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: invalid or missing x-webhook-secret header' },
      { status: 401 }
    );
  }

  try {
    const payload: WebhookPayload = await request.json();

    const sourceType = TABLE_SOURCE_MAP[payload.table];
    if (!sourceType) {
      return NextResponse.json(
        { success: false, error: `Unsupported table: ${payload.table}` },
        { status: 400 }
      );
    }

    const sourceId = getRecordId(payload);
    if (!sourceId) {
      return NextResponse.json(
        { success: false, error: 'Could not extract record ID from payload' },
        { status: 400 }
      );
    }

    if (payload.type === 'DELETE') {
      await deleteEmbedding(sourceType, sourceId);
      return NextResponse.json({
        success: true,
        action: 'deleted',
        source_type: sourceType,
        source_id: sourceId,
      });
    }

    // INSERT or UPDATE: fetch fresh data and generate embedding
    const result = await fetchAndFormatContent(sourceType, sourceId);
    if (!result) {
      return NextResponse.json(
        { success: false, error: `Record not found: ${sourceType}/${sourceId}` },
        { status: 404 }
      );
    }

    const embeddingResult = await generateEmbedding(result.content);
    if (!embeddingResult.success || embeddingResult.embedding.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to generate embedding: ${embeddingResult.error}`,
        },
        { status: 500 }
      );
    }

    await upsertEmbedding(
      {
        source_type: sourceType,
        source_id: sourceId,
        content: result.content,
        metadata: result.metadata,
      },
      embeddingResult.embedding
    );

    return NextResponse.json({
      success: true,
      action: payload.type.toLowerCase(),
      source_type: sourceType,
      source_id: sourceId,
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
