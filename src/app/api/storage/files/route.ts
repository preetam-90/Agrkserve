import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get('bucket');
    const path = searchParams.get('path') || '';

    if (!bucket) {
      return NextResponse.json({ error: 'Missing bucket parameter' }, { status: 400 });
    }

    const { data, error } = await supabase.storage.from(bucket).list(path, {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
      console.error('Error listing files:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ files: data });
  } catch (error: any) {
    console.error('Error in files API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
