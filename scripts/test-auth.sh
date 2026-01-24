#!/bin/bash
# Test Supabase Authentication Setup

echo "🔍 Testing Supabase Authentication Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}"

echo ""
echo "📋 Configuration:"
echo "  URL: ${SUPABASE_URL}"
echo "  Anon Key: ${SUPABASE_ANON_KEY:0:20}..."
echo ""

# Test connection
echo "🔌 Testing Supabase connection..."
response=$(curl -s -o /dev/null -w "%{http_code}" "${SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}")

if [ "$response" = "200" ]; then
    echo "✅ Connection successful!"
else
    echo "❌ Connection failed (HTTP $response)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Check Supabase Dashboard → Authentication → Settings"
echo "   URL: ${SUPABASE_URL}/project/_/auth/users"
echo ""
echo "2. Verify Email Confirmation Settings:"
echo "   - Go to Authentication → Email Templates"
echo "   - Check if 'Confirm signup' is enabled"
echo "   - For testing, you can disable email confirmation"
echo ""
echo "3. Create a Test User:"
echo "   - Visit: http://localhost:3001/login"
echo "   - Click 'Sign Up'"
echo "   - Fill in the form and create an account"
echo ""
echo "4. If email confirmation is enabled:"
echo "   - Check your email inbox"
echo "   - Click the confirmation link"
echo "   - Then try logging in"
echo ""
echo "5. Alternative: Disable email confirmation for testing:"
echo "   - Supabase Dashboard → Authentication → Settings"
echo "   - Scroll to 'Email Auth'"
echo "   - Disable 'Enable email confirmations'"
echo ""
