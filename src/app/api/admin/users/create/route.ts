import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/utils/admin-rbac';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Only allow admins with manage users permission
    await requirePermission('canManageUsers');

    const body = await request.json();
    const { email, password, name } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing email or password' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Create the auth user using the service role (server-side)
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      // mark email as confirmed since admin is provisioning the account
      email_confirm: true,
    } as any);

    if (createError) {
      console.error('Supabase admin.createUser error:', createError);
      return NextResponse.json(
        { success: false, error: createError.message || String(createError) },
        { status: 500 }
      );
    }

    const createdUser = (createData as any)?.user;
    if (!createdUser || !createdUser.id) {
      return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
    }

    // Insert a profile row (best-effort) and default role
    try {
      await supabase.from('user_profiles').upsert({
        id: createdUser.id,
        email: createdUser.email,
        name: name || null,
        created_at: new Date().toISOString(),
      });

      await supabase.from('user_roles').upsert({
        user_id: createdUser.id,
        role: 'user',
        is_active: true,
      });
    } catch (err) {
      // Non-fatal: user was created in Auth, but profile/roles insertion failed
      console.warn('Profile/roles upsert failed for created user:', err);
    }

    return NextResponse.json({ success: true, data: { user: createdUser } });
  } catch (error) {
    console.error('Error in admin create user route:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
