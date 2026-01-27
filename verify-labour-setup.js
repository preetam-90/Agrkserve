#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySetup() {
  console.log('🔍 Verifying Labour Profile Setup...\n');
  
  let allGood = true;
  
  // Check 1: labour_profiles table
  console.log('1. Checking labour_profiles table...');
  const { data: tableData, error: tableError } = await supabase
    .from('labour_profiles')
    .select('*')
    .limit(1);
  
  if (tableError) {
    console.error('   ❌ labour_profiles table not found');
    console.error('   Error:', tableError.message);
    console.error('   → Run migration: supabase/migrations/002_labour_profiles.sql\n');
    allGood = false;
  } else {
    console.log('   ✅ labour_profiles table exists\n');
  }
  
  // Check 2: labour_bookings table
  console.log('2. Checking labour_bookings table...');
  const { data: bookingsData, error: bookingsError } = await supabase
    .from('labour_bookings')
    .select('*')
    .limit(1);
  
  if (bookingsError) {
    console.error('   ❌ labour_bookings table not found');
    console.error('   Error:', bookingsError.message);
    console.error('   → Run migration: supabase/migrations/002_labour_profiles.sql\n');
    allGood = false;
  } else {
    console.log('   ✅ labour_bookings table exists\n');
  }
  
  // Check 3: create_labour_profile function
  console.log('3. Checking create_labour_profile function...');
  const { data: funcData, error: funcError } = await supabase.rpc('create_labour_profile', {
    p_user_id: '00000000-0000-0000-0000-000000000000',
    p_skills: ['Test'],
    p_experience_years: 1,
    p_daily_rate: 100,
    p_hourly_rate: null,
    p_city: 'Test',
    p_address: null,
    p_service_radius_km: 25,
    p_bio: null,
    p_certifications: [],
    p_latitude: 0,
    p_longitude: 0,
  });
  
  if (funcError) {
    if (funcError.message.includes('does not exist')) {
      console.error('   ❌ create_labour_profile function not found');
      console.error('   → Run migration: supabase/migrations/003_labour_rpc_functions.sql\n');
      allGood = false;
    } else if (funcError.message.includes('violates foreign key constraint')) {
      console.log('   ✅ create_labour_profile function exists (foreign key error is expected)\n');
    } else {
      console.error('   ⚠️  Function exists but returned error:', funcError.message);
      console.log('   This might be okay if it\'s a validation error\n');
    }
  } else {
    console.log('   ✅ create_labour_profile function exists\n');
  }
  
  // Check 4: search_labour_nearby function
  console.log('4. Checking search_labour_nearby function...');
  const { data: searchData, error: searchError } = await supabase.rpc('search_labour_nearby', {
    p_latitude: 0,
    p_longitude: 0,
    p_radius_km: 50,
    p_skills: null,
    p_min_rate: null,
    p_max_rate: null,
    p_availability: null,
    p_min_experience: null,
    p_min_rating: null,
    p_search_query: null,
    p_limit: 10,
    p_offset: 0,
  });
  
  if (searchError) {
    if (searchError.message.includes('does not exist')) {
      console.error('   ❌ search_labour_nearby function not found');
      console.error('   → Run migration: supabase/migrations/003_labour_rpc_functions.sql\n');
      allGood = false;
    } else {
      console.log('   ✅ search_labour_nearby function exists\n');
    }
  } else {
    console.log('   ✅ search_labour_nearby function exists\n');
  }
  
  // Summary
  console.log('═══════════════════════════════════════════════════════');
  if (allGood) {
    console.log('✅ All checks passed! Labour profile system is ready.');
    console.log('\nYou can now:');
    console.log('  • Create labour profiles at /provider/labour/create');
    console.log('  • Search for labour at /renter/labour');
    console.log('  • Book labour services');
  } else {
    console.log('❌ Some checks failed. Please run the required migrations.');
    console.log('\nTo fix:');
    console.log('  1. Go to https://app.supabase.com');
    console.log('  2. Open SQL Editor');
    console.log('  3. Run the migrations mentioned above');
    console.log('\nOr run the complete setup:');
    console.log('  → supabase/migrations/COMPLETE_LABOUR_SETUP.sql');
  }
  console.log('═══════════════════════════════════════════════════════\n');
}

verifySetup().catch(err => {
  console.error('❌ Verification failed:', err.message);
  process.exit(1);
});
