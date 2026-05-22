export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

export async function GET() {
  // Never return actual values — only confirm presence
  return NextResponse.json({
    ok: true,
    env: {
      SUPABASE_URL:     !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON:    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      ANTHROPIC:        !!process.env.ANTHROPIC_API_KEY,
      RESEND:           !!process.env.RESEND_API_KEY,
      ADMIN_PASSWORD:   !!process.env.ADMIN_PASSWORD,
    },
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
}
