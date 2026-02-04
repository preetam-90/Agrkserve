import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET system settings
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const { data, error } = await supabase.rpc('get_system_settings', {
      p_category: category,
    });

    if (error) throw error;

    // Convert to key-value object
    const settings: Record<string, any> = {};
    data?.forEach((item: any) => {
      settings[item.key] = item.value;
    });

    return NextResponse.json({ settings, raw: data });
  } catch (error: any) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update system setting
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('update_system_setting', {
      p_key: key,
      p_value: value,
    });

    if (error) throw error;

    return NextResponse.json({ success: true, updated: data });
  } catch (error: any) {
    console.error('Error updating system setting:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
