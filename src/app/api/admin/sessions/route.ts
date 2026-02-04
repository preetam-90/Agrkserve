import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET active sessions
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_active_sessions');

    if (error) throw error;

    return NextResponse.json({ sessions: data || [] });
  } catch (error: any) {
    console.error('Error fetching active sessions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE revoke session or force logout all
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const userId = searchParams.get('user_id');
    const forceAll = searchParams.get('force_all') === 'true';

    if (forceAll) {
      // Force logout all users
      const { data, error } = await supabase.rpc('force_logout_all_users');
      if (error) throw error;
      return NextResponse.json({ success: true, deleted_count: data });
    } else if (userId) {
      // Revoke all sessions for a specific user
      const { data, error } = await supabase.rpc('revoke_user_sessions', {
        p_user_id: userId,
      });
      if (error) throw error;
      return NextResponse.json({ success: true, deleted_count: data });
    } else if (sessionId) {
      // Revoke specific session
      const { data, error } = await supabase.rpc('revoke_session', {
        p_session_id: sessionId,
      });
      if (error) throw error;
      return NextResponse.json({ success: true, revoked: data });
    } else {
      return NextResponse.json({ error: 'session_id, user_id, or force_all required' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error revoking session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
