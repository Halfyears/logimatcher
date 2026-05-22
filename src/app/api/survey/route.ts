export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const leadId = searchParams.get('leadId')
  if (!leadId) return NextResponse.json({ error: 'Missing leadId' }, { status: 400 })

  const { data: lead } = await getAdminClient()
    .from('leads')
    .select('*, warehouse:top_match_id(name)')
    .eq('id', leadId)
    .single()

  const { data: cfgRows } = await getAdminClient().from('config').select('*')
  const cfg = Object.fromEntries((cfgRows || []).map((r: any) => [r.key, r.value]))

  return NextResponse.json({ lead, surveyQuestions: cfg.survey_questions || defaultSurvey })
}

export async function POST(req: Request) {
  const { leadId, responses } = await req.json()

  const { error } = await getAdminClient().from('survey_responses')
    .update({ responses, completed_at: new Date().toISOString() })
    .eq('lead_id', leadId)

  await getAdminClient().from('leads')
    .update({ survey_completed: true, survey_data: responses })
    .eq('id', leadId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

const defaultSurvey = [
  { id: 'connected', question: 'Did you connect with the warehouse?', type: 'single', options: ['Yes, immediately', 'Yes, with some delay', 'Not yet', 'No response'] },
  { id: 'match_quality', question: 'How well did the warehouse match your needs?', type: 'rating', max: 5 },
  { id: 'onboarded', question: 'Have you started working with them?', type: 'single', options: ['Yes, fully onboarded', 'In negotiation', 'Decided not to proceed', 'Still evaluating'] },
  { id: 'recommend', question: 'Would you recommend LogiMatcher?', type: 'single', options: ['Definitely yes', 'Probably yes', 'Probably not', 'Definitely not'] },
  { id: 'feedback', question: 'Any comments or suggestions?', type: 'text' },
]
