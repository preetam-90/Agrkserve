import { createAdminClient } from './supabase/admin';

const USER_ID = '2b89e5a6-830a-406c-b6a9-85c4703843dd';

async function checkAndFixAdmin() {
    const supabase = createAdminClient();

    // Check current roles
    const { data: roles, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', USER_ID);

    console.log('Current roles:', JSON.stringify(roles, null, 2));
    if (error) console.error('Error:', error.message);

    const hasAdmin = roles?.some(r => r.role === 'admin' && r.is_active);
    console.log('Has active admin role:', hasAdmin);

    if (!hasAdmin) {
        console.log('Adding admin role...');
        const { data, error: insertError } = await supabase
            .from('user_roles')
            .upsert({ user_id: USER_ID, role: 'admin', is_active: true }, { onConflict: 'user_id,role' })
            .select();

        if (insertError) console.error('Insert error:', insertError.message);
        else console.log('Admin role added:', JSON.stringify(data, null, 2));
    }
}

checkAndFixAdmin().catch(console.error);
