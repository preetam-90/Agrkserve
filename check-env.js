#!/usr/bin/env node

// Environment Variables Checker for AgriServe
// Run with: node check-env.js

const fs = require('fs');
const path = require('path');

console.log('🔍 AgriServe Environment Check\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

console.log(`📁 .env.local file: ${envExists ? '✅ Found' : '❌ Missing'}`);

if (!envExists) {
  console.log('\n❌ Environment file missing!');
  console.log('👉 Create .env.local with:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  console.log('\n📖 See setup-database.md for complete instructions');
  process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log(`🌐 Supabase URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`🔑 Supabase Key: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);

if (supabaseUrl) {
  console.log(`   URL: ${supabaseUrl}`);
}

if (supabaseKey) {
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);
}

// Test Supabase connection
if (supabaseUrl && supabaseKey) {
  console.log('\n🔗 Testing Supabase connection...');

  fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  })
  .then(response => {
    if (response.ok) {
      console.log('✅ Supabase connection successful!');
      console.log('\n🎯 Next steps:');
      console.log('   1. Run database migrations in Supabase Dashboard');
      console.log('   2. Test user signup at http://localhost:3001/login');
    } else {
      console.log(`❌ Supabase connection failed (${response.status})`);
      console.log('👉 Check your URL and API key');
    }
  })
  .catch(error => {
    console.log('❌ Connection test failed:', error.message);
    console.log('👉 Check your internet connection and credentials');
  });
} else {
  console.log('\n❌ Cannot test connection - missing credentials');
  console.log('👉 Add both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

console.log('\n📚 For complete setup guide, see: setup-database.md');
