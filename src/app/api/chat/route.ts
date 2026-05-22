export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { messages, profile, results, mode } = await req.json()
  const isPreSearch = mode === 'pre_search'

  const bizMap: Record<string,string> = { dtc:'DTC/eCommerce', b2b:'B2B/Wholesale', marketplace:'Amazon Seller', subscription:'Subscription Box', retail:'Retail' }
  const volMap: Record<string,string> = { startup:'<500/mo', growing:'500–2k/mo', established:'2k–10k/mo', enterprise:'10k+/mo' }

  const profileSummary = profile ? `
Business type: ${bizMap[profile.business_type] || profile.business_type}
Monthly orders: ${volMap[profile.monthly_orders] || profile.monthly_orders}
Products: ${(profile.product_type||[]).join(', ')}
Target market: ${profile.location}
Services needed: ${(profile.services||[]).join(', ')}
Timeline: ${profile.timeline}` : ''

  const systemPrompt = isPreSearch ? `You are a friendly, expert fulfillment advisor at LogiMatcher.

The shipper just completed our 6-question quiz. Their profile:
${profileSummary}

Your job is to have a SHORT, focused conversation to extract their specific requirements that the quiz didn't capture. Follow this flow:

1. If this is their FIRST message: Acknowledge their input, ask ONE clarifying follow-up question (e.g. about budget, specific integrations, product weight/dimensions, multi-location needs, or special requirements).

2. If they've shared enough details: Summarize their key requirements in a clear bullet list, then ask "Does this look right? I'll search based on these requirements — or add anything else."

3. If they confirm or say "yes/looks good/search now": Reply with "Perfect! Starting your search now..." (keep it short).

Key requirements to probe for (only ask 1–2 per turn):
- Budget / price sensitivity (e.g. max $/order)
- Must-have platform integrations (Shopify, Amazon, etc.)
- Product characteristics (weight, dimensions, fragile, temperature-sensitive)
- Geographic coverage (single region vs multi-coast vs international)
- Special services (climate control, hazmat, kitting, FBA prep)
- Volume growth plans

Be conversational, warm, and concise. Max 3–4 sentences per reply.
Never make up warehouse names or guarantees.
When summarizing requirements, format as a clean bullet list.` :

`You are a helpful fulfillment expert at LogiMatcher.
Shipper profile:${profileSummary}
Top matched warehouses: ${(results||[]).slice(0,3).map((w:any)=>`${w.name} (${w.location}, ${w.matchScore}% match)`).join('; ')}
Give specific, practical advice in 2–3 sentences. Never fabricate pricing or contract terms.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: systemPrompt,
        messages,
      }),
    })

    const data = await response.json()
    const reply = data.content?.map((c: any) => c.text || '').join('') || "Got it! Let me search for your best matches."

    // Extract a clean note from user messages for the email
    const userMessages = messages.filter((m: any) => m.role === 'user').map((m: any) => m.content).join(' | ')
    const extractedNote = isPreSearch && userMessages.length > 5 ? userMessages : null

    return NextResponse.json({ reply, extractedNote })
  } catch (e: any) {
    console.error('[Chat API]', e.message)
    const fallback = isPreSearch
      ? "Got it! I've noted your requirements. Click 'Confirm & Find My Matches' when ready, or tell me more."
      : "Happy to help! Ask me anything about your matches."
    return NextResponse.json({ reply: fallback, extractedNote: null })
  }
}
