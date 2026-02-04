#!/bin/bash

# Apply Analytics RPC Functions Migration
# This script creates the necessary database functions for the analytics dashboard

echo "🔧 Applying Analytics RPC Functions Migration..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create a .env file with your Supabase credentials"
    exit 1
fi

# Load environment variables
source .env

# Check if required variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Missing required environment variables"
    echo "Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env"
    exit 1
fi

echo "📊 Creating analytics RPC functions..."
echo ""

# Read the migration file
MIGRATION_SQL=$(cat supabase/migrations/019_analytics_rpc_functions.sql)

# Apply the migration using curl
RESPONSE=$(curl -s -X POST \
  "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$MIGRATION_SQL" | jq -Rs .)}")

# Check if the response contains an error
if echo "$RESPONSE" | grep -q "error"; then
    echo "❌ Migration failed. Trying alternative method..."
    echo ""
    echo "Please run this SQL manually in your Supabase SQL Editor:"
    echo "👉 https://supabase.com/dashboard/project/_/sql"
    echo ""
    cat supabase/migrations/019_analytics_rpc_functions.sql
    exit 1
fi

echo "✅ Analytics RPC functions created successfully!"
echo ""
echo "📋 Created functions:"
echo "  - get_platform_analytics()"
echo "  - get_revenue_stats(p_period TEXT)"
echo ""
echo "🎉 Migration complete! Your analytics dashboard should now work with real data."
echo ""
echo "Note: If you still see errors, please run the SQL migration manually:"
echo "1. Go to: https://supabase.com/dashboard/project/_/sql"
echo "2. Copy the contents of: supabase/migrations/019_analytics_rpc_functions.sql"
echo "3. Paste and run in the SQL Editor"
