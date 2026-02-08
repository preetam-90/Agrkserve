import { createClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

// Public endpoint to get system settings (no auth required)
export async function GET() {
  try {
    const supabase = createClient();

    // Try to fetch using RPC function first (for contact/general categories)
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_system_settings', {
      p_category: null,
    });

    if (!rpcError && rpcData) {
      // Convert to key-value object
      const settings: Record<string, unknown> = {};
      rpcData.forEach((item: { key: string; value: unknown }) => {
        settings[item.key] = item.value;
      });

      console.log('📊 Settings API (RPC) - Total fields:', Object.keys(settings).length);
      return NextResponse.json({ settings });
    }

    // Fallback: Direct query with public access
    console.log('⚠️ RPC failed, trying direct query:', rpcError?.message);
    const { data, error } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('category', ['general', 'contact']);

    if (error) {
      console.error('❌ Error fetching settings:', error);
      // Return default settings if database fails
      return NextResponse.json({
        settings: getDefaultSettings(),
      });
    }

    // Convert to key-value object
    const settings: Record<string, unknown> = {};
    data?.forEach((item: { key: string; value: unknown }) => {
      settings[item.key] = item.value;
    });

    console.log('📊 Settings API (Direct) - Total fields:', Object.keys(settings).length);
    return NextResponse.json({ settings });
  } catch (error: unknown) {
    console.error('❌ Error in settings API:', error);
    return NextResponse.json(
      {
        settings: getDefaultSettings(),
      },
      { status: 200 }
    );
  }
}

function getDefaultSettings() {
  return {
    platform_name: 'AgriServe',
    support_email: 'support@agriServe.com',
    support_phone: '+1-555-0123',
    business_address: '123 Farm Road, Agriculture City, AC 12345',
    social_links: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
    },
  };
}
