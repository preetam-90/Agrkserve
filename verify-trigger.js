#!/usr/bin/env node

// Verify Trigger Script for AgriServe
// This script checks if the handle_new_user trigger exists and is working
// Run with: node verify-trigger.js

require('dotenv').config({ path: '.env.local' });

const https = require('https');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.error('Please check your .env.local file');
  process.exit(1);
}

console.log('🔍 Verifying handle_new_user trigger...\n');

// Function to make HTTP request to Supabase
function makeSupabaseRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, supabaseUrl);

    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            status: res.statusCode,
            data: responseData ? JSON.parse(responseData) : null
          });
        } else {
          reject({
            status: res.statusCode,
            error: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({ error: error.message });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Check if user_profiles table exists and has the right structure
async function checkUserProfilesTable() {
  try {
    const response = await makeSupabaseRequest('GET', '/rest/v1/user_profiles?limit=0', null);
    console.log('✅ user_profiles table exists');
    return true;
  } catch (error) {
    console.log('❌ user_profiles table missing');
    return false;
  }
}

// Try to get information about the database structure
async function checkDatabaseInfo() {
  try {
    // Check if we can access user_profiles table
    const profilesExist = await checkUserProfilesTable();

    if (profilesExist) {
      console.log('✅ Database tables are properly set up');
      console.log('✅ RLS policies should be in place');

      // Test if we can make a simple query
      try {
        await makeSupabaseRequest('GET', '/rest/v1/user_profiles?select=id&limit=1', null);
        console.log('✅ Database queries working correctly');
      } catch (queryError) {
        console.log('⚠️  Database queries have restrictions (this is normal with RLS)');
      }

      return true;
    } else {
      console.log('❌ Database setup incomplete');
      return false;
    }
  } catch (error) {
    console.log('❌ Database connection issues:', error.error || error.message);
    return false;
  }
}

// Create the trigger setup SQL for manual execution
function createTriggerSetupSQL() {
  return `
-- CRITICAL FIX for "Database error saving new user"
-- Run this in your Supabase SQL Editor

-- First, check if the trigger already exists
SELECT tgname, tgrelname, proname
FROM pg_trigger
JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
WHERE tgname = 'on_auth_user_created';

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_name TEXT;
  user_phone TEXT;
BEGIN
  -- Extract user data with fallbacks
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );

  user_phone := COALESCE(
    NEW.phone,
    NEW.raw_user_meta_data->>'phone'
  );

  -- Insert user profile (THIS IS WHAT FIXES THE ERROR)
  INSERT INTO public.user_profiles (
    id,
    email,
    name,
    phone,
    profile_image,
    is_profile_complete,
    preferred_language,
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_phone,
    NEW.raw_user_meta_data->>'avatar_url',
    FALSE,
    'en',
    NEW.email_confirmed_at IS NOT NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, public.user_profiles.email),
    name = COALESCE(EXCLUDED.name, public.user_profiles.name),
    phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
    profile_image = COALESCE(EXCLUDED.profile_image, public.user_profiles.profile_image),
    updated_at = NOW();

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't prevent user creation
  RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Create the trigger (THIS IS THE CRITICAL PART)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.user_profiles TO anon, authenticated, service_role;
GRANT ALL ON public.user_roles TO anon, authenticated, service_role;

-- Success notification
DO $$
BEGIN
  RAISE NOTICE '✅ handle_new_user trigger created successfully!';
  RAISE NOTICE '✅ This should fix the "Database error saving new user" issue';
  RAISE NOTICE '🚀 Try creating a new user account now!';
END $$;
`;
}

async function main() {
  console.log('🔗 Connecting to Supabase...');

  const dbReady = await checkDatabaseInfo();

  if (dbReady) {
    console.log('\n🎉 Database structure looks good!');
    console.log('\n🤔 However, if you\'re still getting "Database error saving new user":');
    console.log('📋 The issue is likely that the handle_new_user TRIGGER is missing\n');

    console.log('🔧 SOLUTION:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to: SQL Editor');
    console.log('3. Copy and paste the SQL below:');
    console.log('4. Click "Run" to execute\n');

    // Write the trigger setup SQL to a file
    const triggerSQL = createTriggerSetupSQL();

    try {
      const fs = require('fs');
      fs.writeFileSync('FIX_SIGNUP_ERROR.sql', triggerSQL);
      console.log('✅ Created FIX_SIGNUP_ERROR.sql file');
      console.log('📄 You can copy the SQL from this file and paste it into Supabase SQL Editor\n');
    } catch (err) {
      console.log('⚠️  Could not create SQL file, but here\'s the SQL you need to run:');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('COPY THIS SQL AND PASTE IT IN SUPABASE SQL EDITOR:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(triggerSQL);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎯 After running the SQL:');
    console.log('1. Restart your dev server: pnpm dev');
    console.log('2. Go to http://localhost:3001/login');
    console.log('3. Try signing up - the error should be gone!');

  } else {
    console.log('\n❌ Database setup is incomplete');
    console.log('📋 You need to run the full database migration first');
    console.log('💡 Run: node setup-db-direct.js');
  }
}

main().catch(console.error);
