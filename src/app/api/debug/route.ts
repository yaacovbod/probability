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
    const [studentsRows, bagrutRows] = await Promise.all([
      getSheetValues('תלמידים'),
      getSheetValues('ציוני_בגרות'),
    ])

    // Build bagrut map by ID
    const bagrutHeaders = (bagrutRows[1] ?? []).map((h: string) =>
      (h ?? '').replace(/\r\n/g, '\n').trim()
    )
    const bagrutMap = new Map<string, Record<string, string>>()
    for (const row of bagrutRows.slice(2)) {
      const id = String(row[0] ?? '').trim()
      if (!id) continue
      const obj: Record<string, string> = {}
      bagrutHeaders.forEach((h, i) => { obj[h] = row[i] ?? '' })
      bagrutMap.set(id, obj)
    }

    // Check first 5 students
    const studentSamples = studentsRows.slice(1, 6).map(row => {
      const id = String(row[0] ?? '').trim()
      const name = String(row[1] ?? '')
      const bagrutRow = bagrutMap.get(id)
      return {
        id,
        name,
        foundInBagrut: !!bagrutRow,
        lashonExam: bagrutRow?.['חיצוני\n70%'] ?? 'KEY_NOT_FOUND',
        lashonSchool: bagrutRow?.['ב"ס\n30%'] ?? 'KEY_NOT_FOUND',
        allBagrutKeys: bagrutRow ? Object.keys(bagrutRow).join(' | ') : null,
      }
    })

    const studentIds = studentsRows.slice(1).map(r => String(r[0] ?? '').trim()).filter(Boolean)
    const bagrutIds = bagrutRows.slice(2).map(r => String(r[0] ?? '').trim()).filter(Boolean)
    const bagrutSet = new Set(bagrutIds)
    const matched = studentIds.filter(id => bagrutSet.has(id)).length

    return NextResponse.json({
      idMatching: { totalStudents: studentIds.length, matchedInBagrut: matched },
      studentSamples,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
