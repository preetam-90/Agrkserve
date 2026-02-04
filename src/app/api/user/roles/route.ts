import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UserRole } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role, is_active')
      .eq('user_id', user.id);

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
    }

    return NextResponse.json({ 
      roles: roles?.filter(r => r.is_active).map(r => r.role) || [] 
    });
  } catch (error) {
    console.error('Error in GET /api/user/roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { roles } = body as { roles: UserRole[] };

    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json(
        { error: 'At least one role must be provided' },
        { status: 400 }
      );
    }

    // Validate roles
    const validRoles: UserRole[] = ['renter', 'provider', 'labour', 'admin'];
    const invalidRoles = roles.filter(r => !validRoles.includes(r));
    
    if (invalidRoles.length > 0) {
      return NextResponse.json(
        { error: `Invalid roles: ${invalidRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Get existing roles
    const { data: existingRoles, error: fetchError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (fetchError) {
      console.error('Error fetching existing roles:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch existing roles' }, { status: 500 });
    }

    const existingRoleNames = existingRoles?.map(r => r.role) || [];

    // Determine which roles to add and which to deactivate
    const rolesToAdd = roles.filter(r => !existingRoleNames.includes(r));
    const rolesToActivate = roles.filter(r => existingRoleNames.includes(r));
    const rolesToDeactivate = existingRoleNames.filter(r => !roles.includes(r));

    // Insert new roles
    if (rolesToAdd.length > 0) {
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert(
          rolesToAdd.map(role => ({
            user_id: user.id,
            role,
            is_active: true,
          }))
        );

      if (insertError) {
        console.error('Error inserting roles:', insertError);
        return NextResponse.json({ error: 'Failed to add roles' }, { status: 500 });
      }
    }

    // Activate existing roles
    if (rolesToActivate.length > 0) {
      const { error: activateError } = await supabase
        .from('user_roles')
        .update({ is_active: true })
        .eq('user_id', user.id)
        .in('role', rolesToActivate);

      if (activateError) {
        console.error('Error activating roles:', activateError);
        return NextResponse.json({ error: 'Failed to activate roles' }, { status: 500 });
      }
    }

    // Deactivate roles
    if (rolesToDeactivate.length > 0) {
      const { error: deactivateError } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .in('role', rolesToDeactivate);

      if (deactivateError) {
        console.error('Error deactivating roles:', deactivateError);
        return NextResponse.json({ error: 'Failed to deactivate roles' }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Roles updated successfully',
      roles 
    });
  } catch (error) {
    console.error('Error in POST /api/user/roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
