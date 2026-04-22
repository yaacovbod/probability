import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
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
