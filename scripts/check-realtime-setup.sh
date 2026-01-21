#!/bin/bash

echo "🔍 Checking Supabase Real-Time Setup..."
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    exit 1
fi

# Extract Supabase URL
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2)
PROJECT_REF=$(echo $SUPABASE_URL | sed 's/https:\/\/\(.*\)\.supabase\.co/\1/')

echo "📍 Supabase Project: $PROJECT_REF"
echo ""
echo "⚠️  IMPORTANT STEPS TO ENABLE REAL-TIME:"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/database/replication"
echo ""
echo "2. In the 'Replication' section, find 'Realtime'"
echo ""
echo "3. Enable real-time for the 'bookings' table:"
echo "   ☑️  bookings"
echo ""
echo "4. Click 'Save' at the bottom"
echo ""
echo "5. Run the migration (if not already done):"
echo "   - Copy content from: supabase/migrations/006_enable_realtime.sql"
echo "   - Paste and run in: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo ""
echo "6. Verify in browser console (F12) that you see:"
echo "   ✅ 'Successfully subscribed to booking changes'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🧪 Testing Real-Time:"
echo ""
echo "1. Open two browser windows:"
echo "   - Window 1: http://localhost:3000/provider/bookings (Provider)"
echo "   - Window 2: http://localhost:3000/renter/equipment (Renter)"
echo ""
echo "2. In Window 2 (Renter):"
echo "   - Click on any equipment"
echo "   - Click 'Book Now'"
echo "   - Fill the form and submit"
echo ""
echo "3. In Window 1 (Provider):"
echo "   - You should see a 🔔 notification"
echo "   - New booking appears without refresh"
echo ""
echo "4. Check browser console (F12) for logs:"
echo "   - 'Setting up real-time subscription for user: ...'"
echo "   - 'Subscription status: SUBSCRIBED'"
echo "   - 'Real-time booking event received: ...'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
