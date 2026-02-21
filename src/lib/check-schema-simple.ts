import { createAdminClient } from './supabase/admin';

async function checkConstraint() {
    const supabase = createAdminClient();
    console.log('Checking constraints on platform_knowledge...');

    // We can't directly query pg_catalog easily with the client without RPC,
    // but we can try an upsert and catch the specific error or just try to add it.

    // Method 1: Try to query table info via a common hack (selecting from pg_indexes)
    // Note: This requires the service_role and might still be restricted by some environments.

    const { data, error } = await supabase.rpc('inspect_table_constraints', { t_name: 'platform_knowledge' });

    if (error) {
        console.log('RPC inspect_table_constraints not found or failed. Trying direct query...');
        // We'll use a simple SELECT to verify table exists first
        const { count, error: countError } = await supabase.from('platform_knowledge').select('*', { count: 'exact', head: true });
        if (countError) {
            console.error('Table platform_knowledge might not exist:', countError.message);
            return;
        }
        console.log('Table platform_knowledge exists. Found rows:', count);
    } else {
        console.log('Constraint info:', data);
    }
}

checkConstraint();
