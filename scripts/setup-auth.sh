#!/bin/bash

# AgriServe Authentication Setup Script
# This script helps set up the authentication and profile system

echo "🌾 AgriServe Authentication Setup"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local file not found!${NC}"
    echo ""
    echo "Please create .env.local with the following variables:"
    echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
    exit 1
fi

echo -e "${GREEN}✅ Environment file found${NC}"
echo ""

# Instructions
echo "📋 Setup Instructions:"
echo "====================="
echo ""
echo "1. Run migrations in Supabase SQL Editor (in order):"
echo "   - supabase/migrations/001_initial_schema.sql"
echo "   - supabase/migrations/007_add_phone_mandatory.sql"
echo "   - supabase/migrations/008_setup_storage.sql"
echo ""

echo "2. Configure Authentication in Supabase Dashboard:"
echo "   - Enable Email authentication"
echo "   - Enable Google OAuth (optional)"
echo "   - Add redirect URL: http://localhost:3000/auth/callback"
echo ""

echo "3. Verify Storage Buckets:"
echo "   - Check 'avatars' bucket exists"
echo "   - Check 'equipment-images' bucket exists"
echo "   - Verify bucket policies are applied"
echo ""

echo "4. Test the flows:"
echo "   - Email signup → phone setup → profile picture → onboarding"
echo "   - Google signup → phone check → complete profile"
echo "   - Login → verify redirects"
echo ""

echo -e "${YELLOW}📖 For detailed documentation, see AUTH_PROFILE_GUIDE.md${NC}"
echo ""

# Ask if user wants to open Supabase dashboard
read -p "Would you like to open Supabase dashboard? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2)
    if [ ! -z "$SUPABASE_URL" ]; then
        # Extract project ref from URL
        PROJECT_REF=$(echo $SUPABASE_URL | sed 's/https:\/\///' | cut -d '.' -f1)
        echo -e "${GREEN}Opening Supabase dashboard...${NC}"
        xdg-open "https://supabase.com/dashboard/project/${PROJECT_REF}" 2>/dev/null || \
        open "https://supabase.com/dashboard/project/${PROJECT_REF}" 2>/dev/null || \
        echo "Please open: https://supabase.com/dashboard/project/${PROJECT_REF}"
    fi
fi

echo ""
echo -e "${GREEN}✨ Setup instructions displayed!${NC}"
echo "Follow the steps above to complete the authentication setup."
