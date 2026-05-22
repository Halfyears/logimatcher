export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await getAdminClient().from('config').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const cfg = Object.fromEntries((data || []).map((r: any) => [r.key, r.value]))
  return NextResponse.json(cfg)
}

export async function PUT(req: Request) {
  const body = await req.json()
  const updates = Object.entries(body).map(([key, value]) => ({
    key, value, updated_at: new Date().toISOString()
  }))
  const { error } = await getAdminClient()
    .from('config')
    .upsert(updates, { onConflict: 'key' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
