#!/bin/bash

# Fix Payments Admin Access
# This script applies the migration to allow admins to view all payments

echo "🔧 Fixing admin access to payments table..."

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Apply the migration
echo "📝 Applying migration 027_fix_payments_admin_access.sql..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
    echo ""
    echo "📊 Admins can now:"
    echo "   - View all payments"
    echo "   - Update payment records"
    echo "   - Delete payment records"
    echo ""
    echo "🔄 Please refresh your admin payments page to see the data."
else
    echo "❌ Migration failed. Please check the error above."
    exit 1
fi
