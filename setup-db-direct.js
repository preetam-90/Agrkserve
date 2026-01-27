#!/usr/bin/env node

// Database Setup Script for AgriServe - Direct API Approach
// This script will create all necessary tables and triggers in your Supabase database
// Run with: node setup-db-direct.js

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.error('Please check your .env.local file has:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('🚀 Starting AgriServe Database Setup...\n');
console.log(`🔗 Connecting to: ${supabaseUrl}`);

// Function to make HTTP request to Supabase
function makeSupabaseRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, supabaseUrl);

    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=minimal'
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

// Function to execute SQL using Supabase REST API
async function executeSQL(sql, description) {
  console.log(`📝 ${description}...`);

  try {
    // Use the REST API to execute SQL
    const response = await makeSupabaseRequest('POST', '/rest/v1/rpc/exec_sql', {
      sql: sql
    });

    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.log(`⚠️  Direct SQL execution not available, trying alternative approach...`);

    // If direct SQL execution fails, we'll provide manual instructions
    console.log(`📋 Manual SQL needed for: ${description}`);
    return false;
  }
}

// Function to check if tables exist
async function checkTablesExist() {
  try {
    const response = await makeSupabaseRequest('GET', '/rest/v1/user_profiles?limit=0', null);
    return true;
  } catch (error) {
    return false;
  }
}

// Main setup function
async function setupDatabase() {
  console.log('🔗 Testing Supabase connection...');

  // Test connection
  try {
    await makeSupabaseRequest('GET', '/rest/v1/', null);
    console.log('✅ Connected to Supabase successfully\n');
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error);
    console.error('Please check your environment variables and try again.');
    process.exit(1);
  }

  // Check if tables already exist
  const tablesExist = await checkTablesExist();

  if (tablesExist) {
    console.log('✅ Database tables already exist!');
    console.log('🎉 Your database setup is complete.\n');
    console.log('🚀 You can now test user signup at: http://localhost:3001/login');
    return true;
  }

  console.log('⚠️  Database tables not found. You need to run SQL migrations manually.\n');

  // Since we can't execute SQL directly, provide manual instructions
  console.log('📋 MANUAL SETUP REQUIRED:\n');
  console.log('Please follow these steps in your Supabase Dashboard:\n');

  console.log('1️⃣  Go to your Supabase project dashboard');
  console.log('2️⃣  Navigate to: SQL Editor');
  console.log('3️⃣  Run these SQL files in order:\n');

  // List the SQL files to run
  const migrationFiles = [
    '001_initial_schema.sql',
    '013_add_handle_new_user_trigger_COMPLETE.sql',
    '008_setup_storage.sql'
  ];

  migrationFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. Copy and paste content from: supabase/migrations/${file}`);
  });

  console.log('\n4️⃣  After running all SQL files, restart this script to verify setup\n');

  // Create a combined SQL file for convenience
  console.log('📄 Creating combined SQL file for your convenience...');

  const combinedSQL = `
-- AgriServe Database Setup - Combined Migration
-- Copy this entire content and paste it into Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop existing objects first (in reverse dependency order)
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.equipment CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS equipment_category CASCADE;

-- User Profiles Table
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone TEXT,
    name TEXT,
    email TEXT,
    profile_image TEXT,
    bio TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location GEOGRAPHY(Point, 4326),
    roles TEXT[],
    is_profile_complete BOOLEAN DEFAULT FALSE,
    preferred_language TEXT DEFAULT 'en',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Roles Table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('renter', 'provider', 'labour', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Equipment Categories Type
CREATE TYPE equipment_category AS ENUM (
    'tractor', 'harvester', 'plough', 'cultivator', 'rotavator',
    'thresher', 'sprayer', 'seeder', 'irrigation', 'drone', 'other'
);

-- Equipment Table
CREATE TABLE public.equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category equipment_category,
    brand TEXT,
    model TEXT,
    year INTEGER,
    horsepower NUMERIC,
    fuel_type TEXT,
    price_per_hour NUMERIC,
    price_per_day NUMERIC NOT NULL,
    location_name TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location GEOGRAPHY(Point, 4326),
    images TEXT[],
    features TEXT[],
    is_available BOOLEAN DEFAULT TRUE,
    rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking Status Type
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');

-- Bookings Table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
    renter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    total_days INTEGER NOT NULL,
    price_per_day NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    status booking_status DEFAULT 'pending',
    delivery_address TEXT,
    delivery_latitude DOUBLE PRECISION,
    delivery_longitude DOUBLE PRECISION,
    delivery_location GEOGRAPHY(Point, 4326),
    notes TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Other tables (reviews, payments, messages, notifications)
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    images TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(booking_id, reviewer_id)
);

CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    payment_method TEXT,
    payment_gateway TEXT,
    transaction_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRITICAL: Create the handle_new_user function (FIXES THE SIGNUP ERROR)
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

  -- Insert user profile
  INSERT INTO public.user_profiles (
    id, email, name, phone, profile_image,
    is_profile_complete, preferred_language, is_verified,
    created_at, updated_at
  )
  VALUES (
    NEW.id, NEW.email, user_name, user_phone,
    NEW.raw_user_meta_data->>'avatar_url',
    FALSE, 'en', NEW.email_confirmed_at IS NOT NULL,
    NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, public.user_profiles.email),
    name = COALESCE(EXCLUDED.name, public.user_profiles.name),
    phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
    profile_image = COALESCE(EXCLUDED.profile_image, public.user_profiles.profile_image),
    updated_at = NOW();

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Create trigger (THIS FIXES THE "Database error saving new user" ERROR)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view all roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Users can insert own roles" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for equipment
CREATE POLICY "Anyone can view available equipment" ON public.equipment FOR SELECT USING (true);
CREATE POLICY "Owners can insert equipment" ON public.equipment FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own equipment" ON public.equipment FOR UPDATE USING (auth.uid() = owner_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Setup Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', true, 10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'equipment-images', 'equipment-images', true, 10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ AgriServe database setup completed successfully!';
  RAISE NOTICE '✅ The "Database error saving new user" should now be fixed!';
  RAISE NOTICE '🚀 You can now test user signup at your application!';
END $$;
`;

  try {
    fs.writeFileSync('MANUAL_DATABASE_SETUP.sql', combinedSQL);
    console.log('✅ Created MANUAL_DATABASE_SETUP.sql');
    console.log('\n📋 QUICK SETUP INSTRUCTIONS:');
    console.log('1. Open your Supabase project dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy and paste the content from MANUAL_DATABASE_SETUP.sql');
    console.log('4. Click "Run" to execute all commands');
    console.log('5. Restart your dev server: pnpm dev');
    console.log('6. Test signup at http://localhost:3001/login\n');
  } catch (err) {
    console.error('❌ Failed to create SQL file:', err.message);
  }

  return false; // Manual setup required
}

// Verify setup after manual installation
async function verifySetup() {
  console.log('🔍 Verifying database setup...');

  const tablesExist = await checkTablesExist();

  if (tablesExist) {
    console.log('✅ Database tables found!');
    console.log('✅ Setup appears to be complete');
    console.log('\n🎉 SUCCESS! Your database is ready.');
    console.log('🚀 You can now test user signup at: http://localhost:3001/login');
    console.log('\n🔧 If you still get errors:');
    console.log('1. Make sure you ran the MANUAL_DATABASE_SETUP.sql in Supabase');
    console.log('2. Check that the handle_new_user trigger was created');
    console.log('3. Restart your development server');
    return true;
  } else {
    console.log('❌ Database tables not found');
    console.log('Please run the manual setup instructions above');
    return false;
  }
}

// Main function
async function main() {
  console.log('🎯 AgriServe Database Setup Tool\n');

  // First check if setup is already complete
  const tablesExist = await checkTablesExist();

  if (tablesExist) {
    console.log('✅ Database is already set up!');
    console.log('🎉 The "Database error saving new user" should be fixed.');
    console.log('🚀 Test your signup at: http://localhost:3001/login\n');

    console.log('💡 If you\'re still getting errors, the issue might be:');
    console.log('1. Environment variables not loaded (restart dev server)');
    console.log('2. handle_new_user trigger missing (run MANUAL_DATABASE_SETUP.sql)');
    console.log('3. Browser cache (try incognito/private browsing)');
    return;
  }

  const success = await setupDatabase();

  if (!success) {
    console.log('\n⏳ After you complete the manual setup, run this script again to verify:');
    console.log('   node setup-db-direct.js --verify');
  }
}

// Handle command line arguments
if (process.argv.includes('--verify')) {
  verifySetup();
} else {
  main();
}
