#!/bin/bash
# Apply the handle_new_user trigger migration

echo "🔧 Applying missing handle_new_user trigger migration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found"
    echo ""
    echo "📝 Manual Setup Required:"
    echo ""
    echo "1. Open Supabase Dashboard:"
    echo "   https://ckprtgafbamrmdwflzlf.supabase.co"
    echo ""
    echo "2. Go to: SQL Editor"
    echo ""
    echo "3. Copy and run this file:"
    echo "   supabase/migrations/013_add_handle_new_user_trigger.sql"
    echo ""
    echo "4. Or install Supabase CLI:"
    echo "   npm install -g supabase"
    echo ""
    exit 1
fi

# Apply migration
cd /home/pk/Desktop/agro/agri-serve-web

echo "📤 Uploading migration to Supabase..."
supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "🎉 You can now create new user accounts!"
    echo ""
else
    echo ""
    echo "❌ Failed to apply migration"
    echo ""
    echo "📝 Please apply manually via Supabase Dashboard:"
    echo "   https://ckprtgafbamrmdwflzlf.supabase.co"
    echo ""
    echo "   SQL Editor → Run file:"
    echo "   supabase/migrations/013_add_handle_new_user_trigger.sql"
    echo ""
fi
