import { createAdminClient } from './supabase/admin';

async function checkSchemaDetail() {
    const supabase = createAdminClient();
    console.log('Querying constraints for platform_knowledge...');

    // Directly query pg_indexes to see unique indexes
    const { data, error } = await supabase.from('pg_indexes').select('*').eq('tablename', 'platform_knowledge');

    if (error) {
        console.log('Failed to query pg_indexes. Trying another way...');
        // Try to catch the error by doing a test upsert with a wrong conflict
        const { error: upsertError } = await supabase
            .from('platform_knowledge')
            .upsert({ category: 'platform_info', key: 'test', data: {} }, { onConflict: 'category,key' });

        if (upsertError) {
            console.log('Test upsert failed as expected/unexpected:', upsertError.message);
        } else {
            console.log('Test upsert actually worked?');
        }
    } else {
        console.log('Indexes found:', data);
    }
}

checkSchemaDetail();
