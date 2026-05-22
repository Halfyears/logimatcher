export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/utils'

export async function GET(req: Request) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await getAdminClient()
    .from('survey_responses')
    .select(`
      responses,
      completed_at,
      lead:lead_id(
        shipper_company,
        shipper_name,
        warehouse:top_match_id(name)
      )
    `)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json((data || []).map((r: any) => ({
    company:       r.lead?.shipper_company || r.lead?.shipper_name || 'Unknown',
    warehouse:     r.lead?.warehouse?.name || 'Unknown',
    connected:     r.responses?.connected,
    match_quality: r.responses?.match_quality,
    onboarded:     r.responses?.onboarded,
    recommend:     r.responses?.recommend,
    feedback:      r.responses?.feedback,
    completed_at:  r.completed_at,
  })))
}
