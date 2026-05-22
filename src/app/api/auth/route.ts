export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { password } = await req.json()
    const adminPw = process.env.ADMIN_PASSWORD
    const adminSecret = process.env.ADMIN_SECRET

    if (!adminPw) {
      return NextResponse.json({ error: 'ADMIN_PASSWORD not configured' }, { status: 500 })
    }
    if (password !== adminPw) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
    // Use password itself as token if ADMIN_SECRET not set
    const token = adminSecret || adminPw
    return NextResponse.json({ token })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Also support GET for token validation
export async function GET(req: Request) {
  const token = req.headers.get('x-admin-token') || ''
  const adminSecret = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || ''
  const valid = token === adminSecret && token !== ''
  return NextResponse.json({ valid })
}
