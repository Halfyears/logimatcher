#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

console.log('\n🚀 LogiMatcher Setup\n')

const envPath = path.join(__dirname, '..', '.env.local')
const examplePath = path.join(__dirname, '..', '.env.local.example')

if (!fs.existsSync(envPath)) {
  fs.copyFileSync(examplePath, envPath)
  console.log('✅ Created .env.local — please fill in your credentials')
  console.log('\nRequired values:')
  console.log('  NEXT_PUBLIC_SUPABASE_URL      → from supabase.com project settings')
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY → from supabase.com project settings')
  console.log('  SUPABASE_SERVICE_ROLE_KEY     → from supabase.com project settings')
  console.log('  RESEND_API_KEY                → from resend.com')
  console.log('  ANTHROPIC_API_KEY             → from console.anthropic.com')
  console.log('  ADMIN_PASSWORD                → choose a strong password')
  console.log('  ADMIN_SECRET                  → any random 32-char string')
  console.log('  NEXT_PUBLIC_APP_URL           → http://localhost:3000 for local dev')
} else {
  console.log('✅ .env.local already exists')
}

console.log('\n📋 Next steps:')
console.log('  1. Fill in .env.local')
console.log('  2. Run the SQL in supabase/migrations/001_schema.sql in Supabase SQL Editor')
console.log('  3. npm run dev')
console.log('  4. Visit http://localhost:3000')
console.log('  5. Admin panel at http://localhost:3000/admin\n')
