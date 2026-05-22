export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'
import { scoreWarehouse } from '@/lib/utils'
import { sendWarehouseIntroEmail, sendShipperConfirmEmail } from '@/lib/email'

// POST /api/leads — shipper submits quiz + optional AI chat note + chosen warehouse
export async function POST(req: Request) {
  const body = await req.json()
  const { name, email, phone, company, answers, extra_note = '', chosen_warehouse_id = null } = body

  // Fetch all active warehouses + config
  const [{ data: warehouses, error: whErr }, { data: cfgRows }] = await Promise.all([
    getAdminClient().from('warehouses').select('*').eq('status', 'active'),
    getAdminClient().from('config').select('*'),
  ])

  if (whErr) return NextResponse.json({ error: whErr.message }, { status: 500 })
  if (!warehouses?.length) return NextResponse.json({ error: 'No warehouses available' }, { status: 503 })

  // Score all warehouses — pass extra_note so AI chat affects ranking
  const scored = warehouses
    .map((w: any) => scoreWarehouse(w, answers, extra_note))
    .sort((a: any, b: any) => b.matchScore - a.matchScore)

  // Determine top match:
  // If user explicitly chose a warehouse, honour that choice
  // Otherwise use the highest-scored warehouse
  let topMatch = scored[0]
  if (chosen_warehouse_id) {
    const chosen = scored.find((w: any) => w.id === chosen_warehouse_id)
    if (chosen) topMatch = chosen
  }

  const allScores = scored.map((w: any) => ({
    id: w.id, name: w.name, score: w.matchScore, reasons: w.matchReasons
  }))

  // Build lead record
  const leadRecord: any = {
    shipper_name:      name    || '',
    shipper_email:     email   || '',
    shipper_phone:     phone   || '',
    shipper_company:   company || '',
    answers,
    extra_note,
    top_match_id:      topMatch.id,
    chosen_by_shipper: chosen_warehouse_id || null, // track user's explicit choice
    match_score:       topMatch.matchScore,
    all_scores:        allScores,
    status:            'pending_review',
  }

  const { data: lead, error } = await getAdminClient()
    .from('leads').insert(leadRecord).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auto-approve if configured
  const cfg = Object.fromEntries((cfgRows || []).map((r: any) => [r.key, r.value]))
  if (cfg.review_required === false) {
    await autoSendEmails(lead, topMatch, cfg)
  }

  // Return top 6 results (re-sorted with extra_note applied)
  return NextResponse.json({
    leadId: lead.id,
    results: scored.slice(0, 6).map((w: any) => ({
      id:           w.id,
      name:         w.name,
      location:     w.location,
      region:       w.region,
      logo:         w.logo,
      rating:       w.rating,
      reviews:      w.reviews,
      specialties:  w.specialties,
      services:     w.services,
      integrations: w.integrations,
      pricing:      w.pricing,
      leadTime:     w.lead_time,
      accuracy:     w.accuracy,
      sqft:         w.sqft,
      badge:        w.badge,
      matchScore:   w.matchScore,
      matchReasons: w.matchReasons,
      description:  w.description,
    })),
  })
}

// GET /api/leads — admin list with warehouse details
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  let query = getAdminClient()
    .from('leads')
    .select(`
      *,
      warehouse:top_match_id(name, location, contact_email, lead_fee, plan, logo),
      chosen_warehouse:chosen_by_shipper(name, location, logo)
    `)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH /api/leads — admin actions
export async function PATCH(req: Request) {
  const body = await req.json()
  const { id, action, note, top_match_id } = body

  if (action === 'contact') {
    // Shipper filled in contact form — update their details
    const { data, error } = await getAdminClient()
      .from('leads')
      .update({
        shipper_name:    body.name    || '',
        shipper_email:   body.email   || '',
        shipper_phone:   body.phone   || '',
        shipper_company: body.company || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (action === 'choose_warehouse') {
    // User explicitly chose a different warehouse from results
    const { data, error } = await getAdminClient()
      .from('leads')
      .update({
        chosen_by_shipper: body.warehouse_id,
        top_match_id:      body.warehouse_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (action === 'approve') {
    const { data: lead } = await getAdminClient()
      .from('leads')
      .update({ status: 'approved', admin_note: note || '', updated_at: new Date().toISOString() })
      .eq('id', id).select('*, warehouse:top_match_id(*)').single()

    const { data: cfgRows } = await getAdminClient().from('config').select('*')
    const cfg = Object.fromEntries((cfgRows || []).map((r: any) => [r.key, r.value]))
    if (cfg.auto_send_after_approval !== false) {
      await autoSendEmails(lead, lead.warehouse, cfg)
    }
    return NextResponse.json(lead)
  }

  if (action === 'reject') {
    const { data, error } = await getAdminClient()
      .from('leads')
      .update({ status: 'rejected', admin_note: note || '', updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (action === 'send_emails') {
    const { data: lead, error: leadErr } = await getAdminClient()
      .from('leads').select('*, warehouse:top_match_id(*)').eq('id', id).single()
    if (leadErr || !lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const { data: cfgRows } = await getAdminClient().from('config').select('*')
    const cfg = Object.fromEntries((cfgRows || []).map((r: any) => [r.key, r.value]))

    try {
      await autoSendEmails(lead, lead.warehouse, cfg)
      return NextResponse.json({ ok: true })
    } catch (e: any) {
      // Partial send — return warning not hard error
      return NextResponse.json({ ok: true, warning: e.message })
    }
  }

  if (action === 'reassign') {
    const { data, error } = await getAdminClient()
      .from('leads')
      .update({ top_match_id, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, warehouse:top_match_id(name, location, contact_email, lead_fee, plan, logo, contact_phone)')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (action === 'note') {
    const { data, error } = await getAdminClient()
      .from('leads')
      .update({ admin_note: note, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

async function autoSendEmails(lead: any, warehouse: any, cfg: any) {
  const templates = cfg.email_templates || {}
  const errors: string[] = []

  // Always send to warehouse if contact_email exists (uses default template as fallback)
  if (warehouse?.contact_email) {
    try {
      await sendWarehouseIntroEmail(lead, warehouse, templates.warehouseIntro)
    } catch (e: any) {
      errors.push(`Warehouse email failed: ${e.message}`)
      console.error('[Email] Warehouse intro error:', e)
    }
  } else {
    console.warn('[Email] No warehouse contact_email — skipping warehouse intro')
  }

  // Always send to shipper if shipper_email exists (uses default template as fallback)
  if (lead.shipper_email) {
    try {
      await sendShipperConfirmEmail(lead, warehouse, templates.shipperConfirm)
    } catch (e: any) {
      errors.push(`Shipper email failed: ${e.message}`)
      console.error('[Email] Shipper confirm error:', e)
    }
  } else {
    console.warn('[Email] No shipper_email — skipping shipper confirm')
  }

  // Mark as sent in DB (even partial sends)
  await getAdminClient().from('leads').update({
    warehouse_sent:     !errors.some(e => e.includes('Warehouse')),
    warehouse_sent_at:  new Date().toISOString(),
    shipper_email_sent: !errors.some(e => e.includes('Shipper')),
  }).eq('id', lead.id)

  // Create survey record
  try {
    await getAdminClient().from('survey_responses').insert({
      lead_id: lead.id,
      token: `${lead.id}_${Date.now()}`,
    })
  } catch (e) {
    console.error('[Survey] Insert error:', e)
  }

  if (errors.length) {
    console.error('[Email] Errors:', errors)
    throw new Error(errors.join('; '))
  }
}
