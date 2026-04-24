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

export async function GET() {
  try {
    const token = await getAccessToken()
    const id = process.env.GOOGLE_SHEETS_ID
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${encodeURIComponent('ציוני_תעודה')}!1:3`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    const rows: string[][] = data.values ?? []
    return NextResponse.json({
      row0: rows[0] ?? [],
      row1: rows[1] ?? [],
      row2: rows[2] ?? [],
      row0_json: JSON.stringify(rows[0] ?? []),
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
