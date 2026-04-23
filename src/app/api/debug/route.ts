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

    const studentIds = studentsRows.slice(1).map(r => String(r[0] ?? '').trim()).filter(Boolean)
    const bagrutIds = bagrutRows.slice(2).map(r => String(r[0] ?? '').trim()).filter(Boolean)
    const schoolIds = schoolRows.slice(1).map(r => String(r[0] ?? '').trim()).filter(Boolean)

    const bagrutSet = new Set(bagrutIds)
    const schoolSet = new Set(schoolIds)
    const matchedBagrut = studentIds.filter(id => bagrutSet.has(id))
    const matchedSchool = studentIds.filter(id => schoolSet.has(id))
    const unmatchedBagrut = studentIds.filter(id => !bagrutSet.has(id)).slice(0, 5)

    return NextResponse.json({
      idMatching: {
        totalStudents: studentIds.length,
        matchedInBagrut: matchedBagrut.length,
        matchedInSchool: matchedSchool.length,
        first5StudentIds: studentIds.slice(0, 5),
        first5BagrutIds: bagrutIds.slice(0, 5),
        first5SchoolIds: schoolIds.slice(0, 5),
        unmatchedStudentIds: unmatchedBagrut,
      },
      bagrutSampleRow: { id: bagrutRows[2]?.[0], name: bagrutRows[2]?.[1], col20: bagrutRows[2]?.[20], col28: bagrutRows[2]?.[28] },
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
