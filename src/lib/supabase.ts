import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ── Safe getter — never crashes at module load time ──────────────────────────
function getAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      `Supabase env missing: URL=${!!url} KEY=${!!key}. ` +
      `Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.`
    )
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

function getBrowserClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(url, anon)
}

// Export lazy getters — evaluated at call time, not module load time
export const supabase = getBrowserClient()

// supabaseAdmin: called fresh each time in API routes via getAdminClient()
export { getAdminClient }

// Backward-compat export — same as calling getAdminClient()
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getAdminClient() as any)[prop]
  }
})
