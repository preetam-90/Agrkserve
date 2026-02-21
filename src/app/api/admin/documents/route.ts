import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import type { DocumentType } from '@/lib/services/platform-knowledge-service';
import {
  getPlatformDocuments,
  upsertPlatformDocument,
  deletePlatformDocument,
} from '@/lib/services/platform-knowledge-service';

async function requireAdmin(request: NextRequest): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError) {
    console.error('requireAdmin (docs): Auth error:', authError);
  }

  if (!user) {
    console.log('requireAdmin (docs): No user session found');
    return false;
  }

  console.log('requireAdmin (docs): Found user:', user.id, user.email);

  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true);

  if (rolesError) {
    console.error('requireAdmin (docs): Roles query error:', rolesError);
  }

  const isAdmin = roles?.some((r: { role: string }) => r.role === 'admin') ?? false;
  console.log('requireAdmin (docs): Roles found:', roles?.map(r => r.role), 'isAdmin:', isAdmin);

  return isAdmin;
}

// GET — list all platform documents
export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentType =
      (searchParams.get('documentType') as DocumentType | undefined) || undefined;

    const documents = await getPlatformDocuments(documentType, false);
    return NextResponse.json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST — create or update a platform document
export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { document_type, title, content, chunk_index, metadata, is_active, version } = body;

    if (!document_type || !title || !content) {
      return NextResponse.json(
        { error: 'document_type, title and content are required' },
        { status: 400 }
      );
    }

    const result = await upsertPlatformDocument({
      document_type,
      title,
      content,
      chunk_index,
      metadata,
      is_active,
      version,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE — remove a document by id
export async function DELETE(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Document id is required' }, { status: 400 });
    }

    const result = await deletePlatformDocument(id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH — toggle is_active for a document
export async function PATCH(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, is_active } = body;

    if (!id || typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'id and is_active (boolean) are required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('platform_documents')
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
