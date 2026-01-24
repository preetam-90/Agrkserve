#!/usr/bin/env node

// Database Setup Script for AgriServe
// This script will create all necessary tables and triggers in your Supabase database
// Run with: node setup-db.js

const { createClient } = require('@supabase/supabase-js');
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

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Starting AgriServe Database Setup...\n');

// Function to execute SQL from file
async function executeSQLFile(filePath, description) {
  console.log(`📝 ${description}...`);

  try {
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });

    if (error) {
      console.error(`❌ Error in ${description}:`, error);
      return false;
    }

    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to read or execute ${filePath}:`, err.message);
    return false;
  }
}

// Function to execute SQL directly
async function executeSQL(sql, description) {
  console.log(`📝 ${description}...`);

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error(`❌ Error in ${description}:`, error);
      return false;
    }

    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to execute ${description}:`, err.message);
    return false;
  }
}

// Main setup function
async function setupDatabase() {
  console.log('🔗 Testing Supabase connection...');

  // Test connection
  const { data: testData, error: testError } = await supabase.from('test').select('*').limit(1);
  if (testError && !testError.message.includes('relation "public.test" does not exist')) {
    console.error('❌ Failed to connect to Supabase:', testError);
    process.exit(1);
  }

  console.log('✅ Connected to Supabase successfully\n');

  // Step 1: Create the initial schema
  const initialSchemaSQL = `
-- AgriServe Database Schema
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
    'tractor',
    'harvester',
    'plough',
    'cultivator',
    'rotavator',
    'thresher',
    'sprayer',
    'seeder',
    'irrigation',
    'drone',
    'other'
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
CREATE TYPE booking_status AS ENUM (
    'pending',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled'
);

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

-- Reviews Table
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

-- Payments Table
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

-- Messages Table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
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

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
`;

  const success1 = await executeSQL(initialSchemaSQL, 'Creating initial database schema');
  if (!success1) return false;

  // Step 2: Create RLS policies
  const rlsPoliciesSQL = `
-- RLS Policies for user_profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
CREATE POLICY "Users can view all profiles"
    ON public.user_profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;
CREATE POLICY "Users can view all roles"
    ON public.user_roles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can insert own roles" ON public.user_roles;
CREATE POLICY "Users can insert own roles"
    ON public.user_roles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for equipment
DROP POLICY IF EXISTS "Anyone can view available equipment" ON public.equipment;
CREATE POLICY "Anyone can view available equipment"
    ON public.equipment FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Owners can insert equipment" ON public.equipment;
CREATE POLICY "Owners can insert equipment"
    ON public.equipment FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update own equipment" ON public.equipment;
CREATE POLICY "Owners can update own equipment"
    ON public.equipment FOR UPDATE
    USING (auth.uid() = owner_id);
`;

  const success2 = await executeSQL(rlsPoliciesSQL, 'Creating Row Level Security policies');
  if (!success2) return false;

  // Step 3: Create the handle_new_user trigger (MOST IMPORTANT)
  const triggerSQL = `
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

  -- Insert user profile
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
  ON CONFLICT (id)
  DO UPDATE SET
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

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.user_profiles TO anon, authenticated, service_role;
GRANT ALL ON public.user_roles TO anon, authenticated, service_role;
`;

  const success3 = await executeSQL(triggerSQL, 'Creating handle_new_user trigger (CRITICAL for signup)');
  if (!success3) return false;

  // Step 4: Create storage buckets
  const storageSQL = `
-- Setup Storage for Profile Pictures and Equipment Images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'equipment-images',
  'equipment-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
`;

  const success4 = await executeSQL(storageSQL, 'Setting up storage buckets');
  if (!success4) return false;

  console.log('\n🎉 Database setup completed successfully!\n');
  console.log('✅ All tables created');
  console.log('✅ Row Level Security policies applied');
  console.log('✅ handle_new_user trigger installed (fixes signup error)');
  console.log('✅ Storage buckets configured');
  console.log('\n🚀 You can now test user signup at: http://localhost:3001/login');

  return true;
}

// Check if we need to install missing dependencies
async function checkDependencies() {
  try {
    require('@supabase/supabase-js');
    require('dotenv');
    return true;
  } catch (err) {
    console.log('📦 Installing missing dependencies...');
    const { exec } = require('child_process');

    return new Promise((resolve, reject) => {
      exec('npm install @supabase/supabase-js dotenv', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Failed to install dependencies:', error);
          reject(false);
        } else {
          console.log('✅ Dependencies installed');
          resolve(true);
        }
      });
    });
  }
}

// Run the setup
async function main() {
  try {
    const depsOk = await checkDependencies();
    if (!depsOk) {
      process.exit(1);
    }

    const success = await setupDatabase();
    if (success) {
      console.log('\n🎯 Next steps:');
      console.log('1. Restart your development server: pnpm dev');
      console.log('2. Go to http://localhost:3001/login');
      console.log('3. Try signing up with a new account');
      console.log('4. The "Database error saving new user" should be fixed!');
      process.exit(0);
    } else {
      console.log('\n❌ Setup failed. Please check the errors above.');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { setupDatabase };
