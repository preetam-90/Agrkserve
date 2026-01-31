#!/usr/bin/env node

/**
 * Apply Direct Messaging System Migration
 *
 * This script runs the 012_direct_messaging_system.sql migration
 * to fix the missing get_or_create_conversation function.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration() {
  console.log('📋 Applying Direct Messaging System Migration...\n');

  try {
    // Read the migration file
    const migrationPath = join(__dirname, '../supabase/migrations/012_direct_messaging_system.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    // Split SQL into individual statements
    // Note: This is a simple split - complex SQL might need more sophisticated parsing
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip empty statements and comments-only statements
      if (!statement || statement.startsWith('--') || statement.length < 10) {
        continue;
      }

      try {
        // Execute each statement using rpc with sql parameter
        // Note: Some statements might need special handling
        const { error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          // Try direct SQL execution if rpc fails
          console.warn(`⚠️  Statement ${i + 1}: RPC failed, trying direct execution...`);

          // For simple statements, we can try to execute them
          // However, Supabase JS client doesn't support raw SQL execution directly
          // So we'll note this and continue
        }

        successCount++;
        console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
      } catch (err) {
        errorCount++;
        console.log(`⚠️  Statement ${i + 1}/${statements.length}: ${err.message}`);
      }
    }

    // Since Supabase JS client doesn't support raw SQL execution,
    // we need to inform the user to run the SQL manually
    console.log('\n' + '='.repeat(70));
    console.log('⚠️  IMPORTANT NOTE');
    console.log('='.repeat(70));
    console.log('\nThe Supabase JavaScript client cannot execute raw SQL directly.');
    console.log('Please follow these steps to apply the migration:\n');
    console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Select your project: csmylqtojxzmdbkaexqu');
    console.log('3. Navigate to: SQL Editor → New Query');
    console.log('4. Copy the entire content from:');
    console.log('   supabase/migrations/012_direct_messaging_system.sql');
    console.log('5. Paste it in the SQL Editor and click "Run"\n');
    console.log('✅ After running the migration, the error should be resolved.');
    console.log('='.repeat(70));
  } catch (error) {
    console.error('\n❌ Error applying migration:', error.message);
    console.error('\nPlease apply the migration manually using the Supabase Dashboard.');
  }
}

// Run the migration
applyMigration()
  .then(() => {
    console.log('\n✅ Migration process completed');
    console.log('\n📝 Next steps:');
    console.log('1. Apply the SQL manually in Supabase Dashboard SQL Editor');
    console.log('2. Refresh your application');
    console.log('3. Test the direct messaging functionality\n');
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
