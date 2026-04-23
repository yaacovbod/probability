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
    const bagrutRows = await getSheetValues('ציוני_בגרות')

    return NextResponse.json({
      totalRows: bagrutRows.length,
      row0: bagrutRows[0]?.slice(0, 10),
      row1: bagrutRows[1]?.slice(0, 10),
      row2: bagrutRows[2]?.slice(0, 10),
      row3: bagrutRows[3]?.slice(0, 10),
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
