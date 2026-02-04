import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET maintenance mode status
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_maintenance_mode');

    if (error) throw error;

    return NextResponse.json({ maintenance: data?.[0] || null });
  } catch (error: any) {
    console.error('Error fetching maintenance mode:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update maintenance mode
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { is_enabled, message, scheduled_start, scheduled_end, whitelisted_ips } = body;

    if (is_enabled === undefined) {
      return NextResponse.json({ error: 'is_enabled is required' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('update_maintenance_mode', {
      p_is_enabled: is_enabled,
      p_message: message,
      p_scheduled_start: scheduled_start,
      p_scheduled_end: scheduled_end,
      p_whitelisted_ips: whitelisted_ips,
    });

    if (error) throw error;

    return NextResponse.json({ success: true, updated: data });
  } catch (error: any) {
    console.error('Error updating maintenance mode:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
