# Database Setup Guide

## Setting up Supabase Database

Follow these steps to set up your AgriServe database in Supabase:

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Select your project: `ckprtgafbamrmdwflzlf`
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Migration Script

1. Click **New Query** button
2. Copy the entire content from `supabase/migrations/001_initial_schema.sql`
3. Paste it into the SQL editor
4. Click **Run** button (or press Ctrl+Enter)

This will create all the necessary tables:
- ✅ user_profiles
- ✅ user_roles
- ✅ equipment
- ✅ bookings
- ✅ reviews
- ✅ payments
- ✅ messages
- ✅ notifications

### Step 3: Verify Tables Were Created

1. Click on **Table Editor** in the left sidebar
2. You should see all the tables listed

### Step 4: Enable Google OAuth (Optional)

1. Go to **Authentication** > **Providers**
2. Find **Google** in the list
3. Toggle it to **Enabled**
4. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
5. Add the redirect URL: `https://ckprtgafbamrmdwflzlf.supabase.co/auth/v1/callback`

### Step 5: Test the Connection

1. Start your development server:
   ```bash
   cd agri-serve-web
   pnpm run dev
   ```

2. Visit: http://localhost:3000/test-connection
3. You should see "Connected Successfully!"

### Step 6: Create Your First User

1. Go to http://localhost:3000/login
2. Sign up with your email and password
3. Complete the onboarding process
4. You're ready to use AgriServe!

## Troubleshooting

### Issue: "Could not find the table"
- **Solution**: Make sure you ran the migration script in Step 2

### Issue: "Failed to create profile"
- **Solution**: Check that the user_profiles and user_roles tables exist

### Issue: Google OAuth not working
- **Solution**: Make sure you've enabled and configured Google provider in Supabase

## Database Schema Overview

### User Management
- `user_profiles`: User information and location
- `user_roles`: User roles (renter, provider, labour, admin)

### Equipment Management
- `equipment`: Agricultural equipment listings
- `bookings`: Equipment rental bookings
- `reviews`: User reviews for equipment

### Communication
- `messages`: Direct messages between users
- `notifications`: System notifications

### Payments
- `payments`: Payment transactions and history

## Features Enabled

✅ Row Level Security (RLS) on all tables
✅ Geographic/location queries with PostGIS
✅ Automatic location updates from lat/lng
✅ Automatic timestamp updates
✅ Secure access policies for multi-tenant data

## Next Steps

After setting up the database:
1. Test email authentication at `/login`
2. Complete user onboarding at `/onboarding`
3. Start adding equipment (for providers)
4. Browse and book equipment (for renters)
