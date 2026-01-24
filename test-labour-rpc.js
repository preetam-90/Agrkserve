const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testLabourRPC() {
  console.log('Testing labour RPC functions...\n');
  
  // Test if the function exists by calling it with test data
  const testData = {
    p_user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
    p_skills: ['Plowing', 'Harvesting'],
    p_experience_years: 5,
    p_daily_rate: 500,
    p_hourly_rate: null,
    p_city: 'Test City',
    p_address: null,
    p_service_radius_km: 25,
    p_bio: null,
    p_certifications: [],
    p_latitude: 0,
    p_longitude: 0,
  };
  
  console.log('Calling create_labour_profile with test data...');
  const { data, error } = await supabase.rpc('create_labour_profile', testData);
  
  if (error) {
    console.error('❌ Error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ Function exists and returned:', data);
  }
  
  // Check if labour_profiles table exists
  console.log('\nChecking labour_profiles table...');
  const { data: tableData, error: tableError } = await supabase
    .from('labour_profiles')
    .select('*')
    .limit(1);
  
  if (tableError) {
    console.error('❌ Table error:', tableError);
  } else {
    console.log('✅ Table exists, sample data:', tableData);
  }
}

testLabourRPC().catch(console.error);
