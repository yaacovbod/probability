import { JWT } from 'google-auth-library'
import { Student, BagrutScores, SchoolGrades } from './types'

export type ParsedSheets = {
  students: Student[]
  bagrutScores: BagrutScores[]
  schoolGrades: SchoolGrades[]
}

function n(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null
  const num = Number(val)
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
  const bagrutRaw = rowsToObjects(bagrutRows, 1)
  const schoolRaw = rowsToObjects(schoolRows, 2)

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

  const bagrutScores: BagrutScores[] = bagrutRaw.map(row => ({
    studentId: String(row['תעודת זהות'] ?? row['ת"ז'] ?? ''),
    math_35173: n(row['35173\n25%'] ?? row['35173']),
    math_35371: n(row['35371\n35%'] ?? row['35371']),
    math_35372: n(row['35372\n40%'] ?? row['35372']),
    math_35471: n(row['35471\n65%'] ?? row['35471']),
    math_35472: n(row['35472\n35%'] ?? row['35472']),
    math_35571: n(row['35571\n60%'] ?? row['35571']),
    math_35572: n(row['35572\n40%'] ?? row['35572']),
    lashon_exam: n(row['חיצוני\n70%'] ?? row['בחינה\n70%']),
    lashon_school: n(row['ב"ס\n30%'] ?? row['ה"פ\n30%']),
    history_online: n(row['מבוקרות\n35%']),
    history_exam: n(row['חיצוני\n35%']),
    history_school: n(row['ב"ס\n30%_1']),
    tanach_online: n(row['מבוקרות\n35%_1']),
    tanach_exam: n(row['חיצוני\n35%_1']),
    tanach_school: n(row['ב"ס\n30%_2']),
    civics_online: n(row['מבוקרות\n35%_2']),
    civics_exam: n(row['חיצוני\n35%_2']),
    civics_school: n(row['ב"ס\n30%_3']),
    literature_online: n(row['מבוקרות\n35%_3']),
    literature_exam: n(row['חיצוני\n35%_3']),
    literature_school: n(row['ב"ס\n30%_4']),
    eng_A: n(row['שאלון A\n27%'] ?? row['מרכיב A\n27%']),
    eng_B: n(row['שאלון B\n26%'] ?? row['מרכיב B\n26%']),
    eng_C: n(row['שאלון C\n27%'] ?? row['מרכיב C\n27%']),
    eng_D: n(row['שאלון D\n26%'] ?? row['מרכיב D\n26%']),
    eng_E: n(row['שאלון E\n27%'] ?? row['מרכיב E\n27%']),
    eng_F: n(row['שאלון F\n26%'] ?? row['מרכיב F\n26%']),
    eng_G: n(row['שאלון G\n27%'] ?? row['מרכיב G\n27%']),
    eng_boost: n(row['Boost\n20%'] ?? row['Boost']),
    eng_final: n(row['אנגלית\nסופי'] ?? row['אנגלית\nציון\nסופי']),
    major_bio: n(row['ביולוגיה\nסופי'] ?? row['ביולוגיה\nציון'] ?? row['ביולוגיה']),
    major_motal: n(row['מוט"ל\nסופי'] ?? row['מוט"ל\nציון'] ?? row['מוט"ל']),
    major_languages: n(row['שפות\nסופי'] ?? row['שפות\nציון'] ?? row['שפות']),
    major_other: n(row['מגמה אחרת\nסופי'] ?? row['אחר\nציון'] ?? row['אחר']),
  })).filter(s => s.studentId && s.studentId !== 'undefined' && s.studentId !== '')

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
