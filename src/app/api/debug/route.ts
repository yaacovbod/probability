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
    const id = searchParams.get('id') ?? ''
    const [bagrutRows, studentsRows] = await Promise.all([
      getSheetValues('ציוני_בגרות'),
      getSheetValues('תלמידים'),
    ])

    // list all students: id + name
    const studentsList = studentsRows.slice(1).map(r => ({ id: r[0], name: r[1] }))

    if (!id) {
      return NextResponse.json({ students: studentsList, totalBagrut: bagrutRows.length })
    }

    const studentRow = studentsRows.find(r => String(r[0]).trim() === id)
    const bagrutRow = bagrutRows.find(r => String(r[0]).trim() === id)

    return NextResponse.json({ studentRow, bagrutRow, bagrutLength: bagrutRow?.length })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
