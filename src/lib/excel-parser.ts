import * as XLSX from 'xlsx'
import { Student, BagrutScores, SchoolGrades } from './types'

function n(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null
  const num = Number(val)
  return isNaN(num) ? null : num
}

function bool(val: unknown): boolean {
  if (!val) return false
  return String(val).trim() === 'כן' || val === true || val === 1
}

function normalizeRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(row)) {
    out[key.replace(/\r\n/g, '\n')] = row[key]
  }
  return out
}

export type ParsedExcel = {
  students: Student[]
  bagrutScores: BagrutScores[]
  schoolGrades: SchoolGrades[]
}

export function parseExcel(buffer: ArrayBuffer): ParsedExcel {
  const wb = XLSX.read(buffer, { type: 'array' })

  const studentsSheet = wb.Sheets['תלמידים']
  const bagrutSheet = wb.Sheets['ציוני_בגרות']
  const schoolSheet = wb.Sheets['ציוני_תעודה']

  if (!studentsSheet || !bagrutSheet || !schoolSheet) {
    throw new Error('קובץ Excel חסרים גיליונות: תלמידים, ציוני_בגרות, ציוני_תעודה')
  }

  const studentsRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(studentsSheet, { defval: null })
  const bagrutRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(bagrutSheet, { defval: null, range: 1 })
  const schoolRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(schoolSheet, { defval: null, range: 2 })

  const students: Student[] = studentsRaw.map((row) => ({
    id: String(row['תעודת זהות'] ?? row['ת"ז'] ?? row['תז'] ?? ''),
    fullName: String(row['שם מלא'] ?? ''),
    classGroup: String(row['כיתה'] ?? ''),
    isSpecialEd: bool(row['חינ"מ'] ?? row['חינמ']),
    isLateJoinerLashon: bool(row['הצטרף מאוחר (לשון)'] ?? row['הצטרף מאוחר']),
    attendanceAbsencePct: n(row['אחוז היעדרות'] ?? row['היעדרות %']),
    mathUnits: (n(row['יח"ל מתמטיקה'] ?? row['יח"ל מת']) as 3 | 4 | 5 | null),
    englishUnits: (n(row['יח"ל אנגלית'] ?? row['יח"ל אנג']) as 3 | 4 | 5 | null),
    notes: String(row['הערות'] ?? ''),
  })).filter(s => s.id && s.id !== 'undefined')

  const bagrutScores: BagrutScores[] = bagrutRaw.map((rawRow) => {
    const row = normalizeRow(rawRow)
    return ({
    studentId: String(row['תעודת זהות'] ?? row['ת"ז'] ?? ''),
    math_35173: n(row['35173\n25%'] ?? row['35173']),
    math_35371: n(row['35371\n35%'] ?? row['35371']),
    math_35372: n(row['35372\n40%'] ?? row['35372']),
    math_35471: n(row['35471\n65%'] ?? row['35471']),
    math_35472: n(row['35472\n35%'] ?? row['35472']),
    math_35571: n(row['35571\n60%'] ?? row['35571']),
    math_35572: n(row['35572\n40%'] ?? row['35572']),
    lashon_exam: n(row['חיצוני\n70%'] ?? row['בחינה\n70%'] ?? row['לשון\nבחינה'] ?? row['בחינה']),
    lashon_school: n(row['ב"ס\n30%'] ?? row['ה"פ\n30%'] ?? row['לשון\nה"פ']),
    history_online: n(row['מבוקרות\n35%'] ?? row['היסטוריה\nמשימות\n35%'] ?? row['היסטוריה\nמשימות']),
    history_exam: n(row['חיצוני\n35%'] ?? row['היסטוריה\nבחינה\n35%'] ?? row['היסטוריה\nבחינה']),
    history_school: n(row['ב"ס\n30%_1'] ?? row['היסטוריה\nה"פ\n30%'] ?? row['היסטוריה\nה"פ']),
    tanach_online: n(row['מבוקרות\n35%_1'] ?? row['תנ"ך\nמשימות\n35%'] ?? row['תנ"ך\nמשימות']),
    tanach_exam: n(row['חיצוני\n35%_1'] ?? row['תנ"ך\nבחינה\n35%'] ?? row['תנ"ך\nבחינה']),
    tanach_school: n(row['ב"ס\n30%_2'] ?? row['תנ"ך\nה"פ\n30%'] ?? row['תנ"ך\nה"פ']),
    civics_online: n(row['מבוקרות\n35%_2'] ?? row['אזרחות\nמשימות\n35%'] ?? row['אזרחות\nמשימות']),
    civics_exam: n(row['חיצוני\n35%_2'] ?? row['אזרחות\nבחינה\n35%'] ?? row['אזרחות\nבחינה']),
    civics_school: n(row['ב"ס\n30%_3'] ?? row['אזרחות\nה"פ\n30%'] ?? row['אזרחות\nה"פ']),
    literature_online: n(row['מבוקרות\n35%_3'] ?? row['ספרות\nמשימות\n35%'] ?? row['ספרות\nמשימות']),
    literature_exam: n(row['חיצוני\n35%_3'] ?? row['ספרות\nבחינה\n35%'] ?? row['ספרות\nבחינה']),
    literature_school: n(row['ב"ס\n30%_4'] ?? row['ספרות\nה"פ\n30%'] ?? row['ספרות\nה"פ']),
    eng_A: n(row['שאלון A\n27%'] ?? row['מרכיב A\n27%'] ?? row['שאלון A'] ?? row['מרכיב A']),
    eng_B: n(row['שאלון B\n26%'] ?? row['מרכיב B\n26%'] ?? row['שאלון B'] ?? row['מרכיב B']),
    eng_C: n(row['שאלון C\n27%'] ?? row['מרכיב C\n27%'] ?? row['שאלון C'] ?? row['מרכיב C']),
    eng_D: n(row['שאלון D\n26%'] ?? row['מרכיב D\n26%'] ?? row['שאלון D'] ?? row['מרכיב D']),
    eng_E: n(row['שאלון E\n27%'] ?? row['מרכיב E\n27%'] ?? row['שאלון E'] ?? row['מרכיב E']),
    eng_F: n(row['שאלון F\n26%'] ?? row['מרכיב F\n26%'] ?? row['שאלון F'] ?? row['מרכיב F']),
    eng_G: n(row['שאלון G\n27%'] ?? row['מרכיב G\n27%'] ?? row['שאלון G'] ?? row['מרכיב G']),
    eng_boost: n(row['Boost\n20%'] ?? row['Boost']),
    eng_final: n(row['אנגלית\nסופי'] ?? row['אנגלית\nציון\nסופי'] ?? row['אנגלית ציון']),
    major_bio: n(row['ביולוגיה\nסופי'] ?? row['ביולוגיה\nציון'] ?? row['ביולוגיה']),
    major_motal: n(row['מוט"ל\nסופי'] ?? row['מוט"ל\nציון'] ?? row['מוט"ל']),
    major_languages: n(row['שפות\nסופי'] ?? row['שפות\nציון'] ?? row['שפות']),
    major_other: n(row['מגמה אחרת\nסופי'] ?? row['אחר\nציון'] ?? row['אחר']),
  })}).filter(s => s.studentId && s.studentId !== 'undefined')

  const schoolGrades: SchoolGrades[] = schoolRaw.map((row) => ({
    studentId: String(row['ת.ז'] ?? row['תעודת זהות'] ?? row['ת"ז'] ?? ''),
    civics: n(row['אזרחות']),
    english: n(row['אנגלית 5 יח"ל'] ?? row['אנגלית 4 יח"ל'] ?? row['אנגלית']),
    history: n(row['היסטוריה']),
    hebrew: n(row['לשון'] ?? row['עברית'] ?? row["עב''ר"]),
    math: n(row['מתמטיקה 5 יח"ל'] ?? row['מתמטיקה 4 יח"ל'] ?? row['מתמטיקה 3 יח"ל'] ?? row['מתמטיקה']),
    bible: n(row['תנ"ך'] ?? row['תנך']),
    literature: n(row['ספרות']),
    pe: n(row['חינוך גופני'] ?? row['חינוך גופני בנות'] ?? row['חינוך גופני בנים']),
    major: (() => {
      const vals = [
        n(row['ביולוגיה']), n(row['אומנות']), n(row['מדעי המחשב']),
        n(row['מידע ונתונים']), n(row['ניהול עסקי']), n(row['ניהול עסקי - יזמות']),
        n(row['פיזיקה']), n(row['פסיכולוגיה']), n(row['תקשורת']),
      ].filter((v): v is number => v !== null)
      return vals.length > 0 ? Math.max(...vals) : null
    })(),
  })).filter(s => s.studentId && s.studentId !== 'undefined')

  return { students, bagrutScores, schoolGrades }
}
