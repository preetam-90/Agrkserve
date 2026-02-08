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

export async function DELETE(request: NextRequest) {
  try {
    const { bucket, paths } = await request.json();

    if (!bucket || !paths || !Array.isArray(paths)) {
      return NextResponse.json({ error: 'Missing bucket or paths parameter' }, { status: 400 });
    }

    const { data, error } = await supabase.storage.from(bucket).remove(paths);

    if (error) {
      console.error('Error deleting files:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, success: true });
  } catch (error: unknown) {
    console.error('Error in delete API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
