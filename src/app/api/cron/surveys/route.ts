export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'
import { sendSurveyEmail } from '@/lib/email'

// Triggered daily by Vercel Cron. Sends survey emails to shippers
// whose intro email was sent survey_delay_days ago (default: 7).
export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getAdminClient()
  const { data: cfgRows } = await db.from('config').select('*')
  const cfg = Object.fromEntries((cfgRows || []).map((r: any) => [r.key, r.value]))
  const delayDays: number = cfg.survey_delay_days ?? 7
  const cutoff = new Date(Date.now() - delayDays * 24 * 60 * 60 * 1000).toISOString()

  const { data: leads, error } = await db
    .from('leads')
    .select('*, warehouse:top_match_id(name, location, rating, reviews)')
    .eq('survey_sent', false)
    .eq('warehouse_sent', true)
    .lt('warehouse_sent_at', cutoff)
    .not('shipper_email', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!leads?.length) return NextResponse.json({ sent: 0, message: 'No surveys due' })

  const surveyTemplate = cfg.email_templates?.surveyInvite
  const sent: string[] = []
  const failed: string[] = []

  for (const lead of leads) {
    try {
      await sendSurveyEmail(lead, lead.warehouse, surveyTemplate)
      await db.from('leads').update({
        survey_sent:    true,
        survey_sent_at: new Date().toISOString(),
      }).eq('id', lead.id)
      sent.push(lead.id)
    } catch (e: any) {
      failed.push(`${lead.id}: ${e.message}`)
      console.error('[Cron/surveys] Failed for lead', lead.id, e.message)
    }
  }

  console.log(`[Cron/surveys] sent=${sent.length} failed=${failed.length}`)
  return NextResponse.json({ sent: sent.length, failed: failed.length, ids: sent })
}
