import { JWT } from 'google-auth-library'
import { Student, BagrutScores, SchoolGrades } from './types'

export type ParsedSheets = {
  students: Student[]
  bagrutScores: BagrutScores[]
  schoolGrades: SchoolGrades[]
}

function n(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null
  const num = Number(String(val).replace('%', '').trim())
  return isNaN(num) ? null : num
}

function bool(val: unknown): boolean {
  if (!val) return false
  return String(val).trim() === 'כן' || val === true || val === 1
}

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
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Sheets API error: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.values ?? []
}

function rowsToObjects(rows: string[][], headerRowIndex = 0): Record<string, unknown>[] {
  if (rows.length <= headerRowIndex) return []
  const rawHeaders = rows[headerRowIndex]

  const headerCounts: Record<string, number> = {}
  const headers = rawHeaders.map(h => {
    const normalized = (h ?? '').replace(/\r\n/g, '\n').trim()
    if (headerCounts[normalized] !== undefined) {
      headerCounts[normalized]++
      return `${normalized}_${headerCounts[normalized]}`
    }
    headerCounts[normalized] = 0
    return normalized
  })

  return rows.slice(headerRowIndex + 1).map(row => {
    const obj: Record<string, unknown> = {}
    headers.forEach((h, i) => {
      obj[h] = row[i] === '' || row[i] === undefined ? null : row[i]
    })
    return obj
  })
}

export async function fetchSheetsData(): Promise<ParsedSheets> {
  const [studentsRows, bagrutRows, schoolRows] = await Promise.all([
    getSheetValues('תלמידים'),
    getSheetValues('ציוני_בגרות'),
    getSheetValues('ציוני_תעודה'),
  ])

  const studentsRaw = rowsToObjects(studentsRows, 0)
  const schoolRaw = rowsToObjects(schoolRows, 0)
  // bagrut sheet has no column-header row — row 0 is merged category, data starts at row 1
  const bagrutDataRows = bagrutRows.slice(1)

  const students: Student[] = studentsRaw.map(row => ({
    id: String(row['תעודת זהות'] ?? row['ת"ז'] ?? row['תז'] ?? ''),
    fullName: String(row['שם מלא'] ?? ''),
    classGroup: String(row['כיתה'] ?? ''),
    isSpecialEd: bool(row['חינוך מיוחד'] ?? row['חינ"מ'] ?? row['חינמ']),
    isLateJoinerLashon: bool(row['הצטרף מאוחר (לשון)'] ?? row['הצטרף מאוחר']),
    attendanceAbsencePct: n(row['אחוז היעדרויות'] ?? row['אחוז היעדרות'] ?? row['היעדרות %']),
    mathUnits: n(row['יח"ל מתמטיקה'] ?? row['יח"ל מת']) as 3 | 4 | 5 | null,
    englishUnits: n(row['יח"ל אנגלית'] ?? row['יח"ל אנג']) as 3 | 4 | 5 | null,
    notes: String(row['הערות'] ?? ''),
  })).filter(s => s.id && s.id !== 'undefined' && s.id !== '')

  const bagrutScores: BagrutScores[] = bagrutDataRows
    .filter(row => row[0] && String(row[0]).trim())
    .map(row => ({
      studentId: String(row[0] ?? '').trim(),
      eng_A: n(row[3]),
      eng_B: n(row[4]),
      eng_C: n(row[5]),
      eng_D: n(row[6]),
      eng_E: n(row[7]),
      eng_F: n(row[8]),
      eng_G: n(row[9]),
      eng_boost: n(row[10]),
      eng_final: n(row[11]),
      math_35173: n(row[12]),
      math_35371: n(row[13]),
      math_35372: n(row[14]),
      math_35471: n(row[15]),
      math_35472: n(row[16]),
      math_35571: n(row[17]),
      math_35572: n(row[18]),
      lashon_exam: n(row[20]),
      lashon_school: n(row[21]),
      history_online: n(row[23]),
      history_exam: n(row[24]),
      history_school: n(row[25]),
      tanach_online: n(row[27]),
      tanach_exam: n(row[28]),
      tanach_school: n(row[29]),
      civics_online: n(row[31]),
      civics_exam: n(row[32]),
      civics_school: n(row[33]),
      literature_online: n(row[35]),
      literature_exam: n(row[36]),
      literature_school: n(row[37]),
      major_bio: n(row[39]),
      major_motal: n(row[40]),
      major_languages: n(row[41]),
      major_other: n(row[42]),
    }))

  const schoolGrades: SchoolGrades[] = schoolRaw.map(row => ({
    studentId: String(row['ת.ז'] ?? row['תעודת זהות'] ?? row['ת"ז'] ?? ''),
    civics: n(row['אזרחות']),
    english: n(row['אנגלית 5 יח"ל'] ?? row['אנגלית 4 יח"ל'] ?? row['אנגלית']),
    history: n(row['היסטוריה']),
    hebrew: n(row['לשון'] ?? row['עברית'] ?? row["עב''ר"]),
    math: n(row['מתמטיקה 5 יח"ל'] ?? row['מתמטיקה 4 יח"ל'] ?? row['מתמטיקה 3 יח"ל'] ?? row['מתמטיקה']),
    bible: n(row['תנ"ך'] ?? row['תנך']),
    literature: n(row['ספרות']),
    pe: n(row['חינוך גופני'] ?? row['חינוך גופני בנות'] ?? row['חינוך גופני בנים']),
  })).filter(s => s.studentId && s.studentId !== 'undefined' && s.studentId !== '')

  return { students, bagrutScores, schoolGrades }
}
