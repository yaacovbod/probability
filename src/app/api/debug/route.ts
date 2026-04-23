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

export async function GET() {
  try {
    const [studentsRows, bagrutRows, schoolRows] = await Promise.all([
      getSheetValues('תלמידים'),
      getSheetValues('ציוני_בגרות'),
      getSheetValues('ציוני_תעודה'),
    ])

    return NextResponse.json({
      students: {
        headerRow0: studentsRows[0] ?? [],
        firstDataRow: studentsRows[1] ?? [],
        totalRows: studentsRows.length,
      },
      bagrut: {
        headerRow0: bagrutRows[0] ?? [],
        headerRow1: bagrutRows[1] ?? [],
        firstDataRow: bagrutRows[2] ?? [],
        totalRows: bagrutRows.length,
      },
      school: {
        headerRow0: schoolRows[0] ?? [],
        headerRow1: schoolRows[1] ?? [],
        headerRow2: schoolRows[2] ?? [],
        firstDataRow: schoolRows[3] ?? [],
        totalRows: schoolRows.length,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
