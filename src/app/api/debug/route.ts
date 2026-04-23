export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { JWT } from 'google-auth-library'

async function getAccessToken(): Promise<string> {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!)
  const client = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })
  const { token } = await client.getAccessToken()
  return token!
}

async function getSheetValues(sheetName: string): Promise<string[][]> {
  const token = await getAccessToken()
  const id = process.env.GOOGLE_SHEETS_ID
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${encodeURIComponent(sheetName)}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
  if (!res.ok) return [['ERROR: ' + res.status + ' ' + await res.text()]]
  const data = await res.json()
  return data.values ?? []
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const name = searchParams.get('name') ?? ''
    const [bagrutRows, studentsRows] = await Promise.all([
      getSheetValues('ציוני_בגרות'),
      getSheetValues('תלמידים'),
    ])

    const studentRow = studentsRows.find(r => r.join('').includes(name))
    const studentId = studentRow ? String(studentRow[0] ?? studentRow[1] ?? '') : null

    const bagrutRow = bagrutRows.find(r => r[0] && String(r[0]).trim() === (studentId ?? ''))

    return NextResponse.json({
      studentRow,
      studentId,
      bagrutRow,
      totalBagrut: bagrutRows.length,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
