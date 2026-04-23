import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body || typeof body !== 'object' || !('password' in body) || typeof (body as Record<string, unknown>).password !== 'string') {
    return NextResponse.json({ error: 'Missing password' }, { status: 400 })
  }

  const { password } = body as { password: string }
  const correct = process.env.APP_PASSWORD ?? 'bagrut2024'

  if (password === correct) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('auth_token', correct, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return res
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
