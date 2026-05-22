import { Resend } from 'resend'
import { renderTemplate, buildEmailVars } from './utils'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL || 'noreply@logimatcher.com'

// ── Built-in default templates (used when DB has no templates configured) ────
export const DEFAULT_TEMPLATES = {
  warehouseIntro: {
    subject: 'New Fulfillment Inquiry — {{shipper_company}} via LogiMatcher',
    body: `Hi {{warehouse_name}} team,

You have a new fulfillment inquiry from LogiMatcher!

SHIPPER DETAILS
───────────────
Company: {{shipper_company}}
Contact: {{shipper_name}}
Email:   {{shipper_email}}
Phone:   {{shipper_phone}}

BUSINESS REQUIREMENTS
─────────────────────
Business Type:    {{business_type}}
Monthly Orders:   {{monthly_orders}}
Product Types:    {{product_types}}
Target Market:    {{location}}
Services Needed:  {{services}}
Timeline:         {{timeline}}

AI Match Score:   {{match_score}}% compatibility

NEXT STEPS
──────────
Please reply directly to this email to connect with {{shipper_company}}.
This introduction is provided by LogiMatcher — AI-powered 3PL matching.

Thank you for being part of the LogiMatcher network!

— The LogiMatcher Team
https://logimatcher.com`
  },
  shipperConfirm: {
    subject: 'Your LogiMatcher Introduction — {{warehouse_name}} is Ready',
    body: `Hi {{shipper_name}},

Great news! We've matched you with {{warehouse_name}} and sent them your inquiry.

YOUR MATCH
──────────
Warehouse:   {{warehouse_name}}
Location:    {{warehouse_location}}
Rating:      {{warehouse_rating}} ⭐
Match Score: {{match_score}}%

WHAT HAPPENS NEXT
─────────────────
1. {{warehouse_name}} will contact you directly within 1–2 business days
2. Discuss your specific requirements and get a custom quote
3. Start shipping!

In {{days}} days, we'll send you a quick survey to see how it went.

Thank you for using LogiMatcher — the free AI-powered 3PL matching platform.

— The LogiMatcher Team
https://logimatcher.com

P.S. Have questions? Reply to this email anytime.`
  }
}

// ── Build email body with AI note appended ────────────────────────────────────
function buildWarehouseEmailBody(lead: any, warehouse: any, templateBody: string): string {
  const vars = buildEmailVars(lead, warehouse)
  let body = renderTemplate(templateBody, vars)

  const extras: string[] = []

  if (lead.extra_note) {
    extras.push(`\nADDITIONAL REQUIREMENTS (from AI conversation)\n${'─'.repeat(48)}\n${lead.extra_note}`)
  }

  const answers = lead.answers || {}
  const details: string[] = []
  if (answers.services?.length)      details.push(`Services needed: ${answers.services.join(', ')}`)
  if (answers.product_type?.length)  details.push(`Product types: ${answers.product_type.join(', ')}`)
  if (answers.timeline)              details.push(`Start timeline: ${answers.timeline}`)
  if (lead.match_score)              details.push(`AI compatibility score: ${lead.match_score}%`)

  if (details.length) {
    extras.push(`\nREQUIREMENT SUMMARY\n${'─'.repeat(20)}\n${details.join('\n')}`)
  }

  return body + extras.join('\n')
}

// ── Send warehouse intro email ─────────────────────────────────────────────────
export async function sendWarehouseIntroEmail(lead: any, warehouse: any, template?: any) {
  // Always fall back to default template if none configured
  const tpl = (template?.subject && template?.body) ? template : DEFAULT_TEMPLATES.warehouseIntro
  const vars = buildEmailVars(lead, warehouse)
  const subject = renderTemplate(tpl.subject, vars)
  const text = buildWarehouseEmailBody(lead, warehouse, tpl.body)

  const result = await resend.emails.send({
    from: FROM,
    to: warehouse.contact_email,
    subject,
    text,
    reply_to: lead.shipper_email,
  })

  console.log('[Email] Warehouse intro sent to', warehouse.contact_email, result)
  return result
}

// ── Send shipper confirmation email ───────────────────────────────────────────
export async function sendShipperConfirmEmail(lead: any, warehouse: any, template?: any) {
  const tpl = (template?.subject && template?.body) ? template : DEFAULT_TEMPLATES.shipperConfirm
  const vars = buildEmailVars(lead, warehouse)
  const subject = renderTemplate(tpl.subject, vars)
  const text = renderTemplate(tpl.body, vars)

  const result = await resend.emails.send({
    from: FROM,
    to: lead.shipper_email,
    subject,
    text,
  })

  console.log('[Email] Shipper confirm sent to', lead.shipper_email, result)
  return result
}

// ── Send survey email ──────────────────────────────────────────────────────────
export async function sendSurveyEmail(lead: any, warehouse: any, template?: any) {
  const tpl = template || { subject: 'How did your LogiMatcher introduction go?', body: 'Hi {{shipper_name}},\n\nPlease take a moment to rate your experience:\n{{survey_link}}\n\nThank you!\n— LogiMatcher Team' }
  const vars = buildEmailVars(lead, warehouse)
  const subject = renderTemplate(tpl.subject, vars)
  const text = renderTemplate(tpl.body, vars)

  return resend.emails.send({
    from: FROM,
    to: lead.shipper_email,
    subject,
    text,
  })
}
