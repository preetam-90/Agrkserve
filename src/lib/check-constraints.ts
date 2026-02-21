import { createAdminClient } from './supabase/admin';

async function verifyAllConstraints() {
    const supabase = createAdminClient();
    console.log('--- Database Constraint Verification ---');

    const query = `
    SELECT 
      conname as constraint_name, 
      contype as constraint_type, 
      relname as table_name,
      pg_get_constraintdef(c.oid) as definition
    FROM pg_constraint c
    JOIN pg_class cr ON c.conrelid = cr.oid
    WHERE relname IN ('platform_knowledge', 'platform_documents')
    AND contype = 'u';
  `;

    // Use RPC to execute the raw query if possible, or try to select from a view
    // But since we can't easily run arbitrary SQL via the client without an RPC,
    // we'll try to find if there's a unique constraint by trying upserts that SHOULD fail.

    console.log('Testing platform_knowledge upsert...');
    const { error: error1 } = await supabase
        .from('platform_knowledge')
        .upsert({ category: 'metadata', key: 'test_con', data: {} }, { onConflict: 'category,key' });
    console.log('platform_knowledge result:', error1 ? error1.message : 'SUCCESS');

    console.log('Testing platform_documents upsert...');
    const { error: error2 } = await supabase
        .from('platform_documents')
        .upsert({ document_type: 'about_platform', title: 'test', content: 'test' }, { onConflict: 'document_type,title,chunk_index' });
    console.log('platform_documents result:', error2 ? error2.message : 'SUCCESS');
}

verifyAllConstraints();
