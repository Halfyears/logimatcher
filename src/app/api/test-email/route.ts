export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const to = searchParams.get('to') || ''
  if (!to) return NextResponse.json({ error: 'Pass ?to=your@email.com' }, { status: 400 })

  const apiKey = process.env.RESEND_API_KEY
  const from   = process.env.RESEND_FROM_EMAIL || 'noreply@logimatcher.com'
  if (!apiKey) return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 500 })

  const resend = new Resend(apiKey)
  try {
    const result = await resend.emails.send({
      from,
      to,
      subject: 'LogiMatcher Email Test',
      text: `Test email from LogiMatcher.\nFrom: ${from}\nTo: ${to}\nTime: ${new Date().toISOString()}`,
    })
    return NextResponse.json({ ok: true, result, from, to, apiKeyPrefix: apiKey.slice(0,8)+'...' })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message, from, to }, { status: 500 })
  }
}
