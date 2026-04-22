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
  const schoolRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(schoolSheet, { defval: null })

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

  const bagrutScores: BagrutScores[] = bagrutRaw.map((row) => ({
    studentId: String(row['תעודת זהות'] ?? row['ת"ז'] ?? ''),
    math_35173: n(row['35173\n25%'] ?? row['35173']),
    math_35371: n(row['35371\n35%'] ?? row['35371']),
    math_35372: n(row['35372\n40%'] ?? row['35372']),
    math_35471: n(row['35471\n65%'] ?? row['35471']),
    math_35472: n(row['35472\n35%'] ?? row['35472']),
    math_35571: n(row['35571\n60%'] ?? row['35571']),
    math_35572: n(row['35572\n40%'] ?? row['35572']),
    lashon_exam: n(row['בחינה\n70%'] ?? row['לשון\nבחינה'] ?? row['בחינה']),
    lashon_school: n(row['ה"פ\n30%'] ?? row['לשון\nה"פ']),
    history_online: n(row['היסטוריה\nמשימות\n35%'] ?? row['היסטוריה\nמשימות']),
    history_exam: n(row['היסטוריה\nבחינה\n35%'] ?? row['היסטוריה\nבחינה']),
    history_school: n(row['היסטוריה\nה"פ\n30%'] ?? row['היסטוריה\nה"פ']),
    tanach_online: n(row['תנ"ך\nמשימות\n35%'] ?? row['תנ"ך\nמשימות']),
    tanach_exam: n(row['תנ"ך\nבחינה\n35%'] ?? row['תנ"ך\nבחינה']),
    tanach_school: n(row['תנ"ך\nה"פ\n30%'] ?? row['תנ"ך\nה"פ']),
    civics_online: n(row['אזרחות\nמשימות\n35%'] ?? row['אזרחות\nמשימות']),
    civics_exam: n(row['אזרחות\nבחינה\n35%'] ?? row['אזרחות\nבחינה']),
    civics_school: n(row['אזרחות\nה"פ\n30%'] ?? row['אזרחות\nה"פ']),
    literature_online: n(row['ספרות\nמשימות\n35%'] ?? row['ספרות\nמשימות']),
    literature_exam: n(row['ספרות\nבחינה\n35%'] ?? row['ספרות\nבחינה']),
    literature_school: n(row['ספרות\nה"פ\n30%'] ?? row['ספרות\nה"פ']),
    eng_A: n(row['מרכיב A\n27%'] ?? row['מרכיב A']),
    eng_B: n(row['מרכיב B\n26%'] ?? row['מרכיב B']),
    eng_C: n(row['מרכיב C\n27%'] ?? row['מרכיב C']),
    eng_D: n(row['מרכיב D\n26%'] ?? row['מרכיב D']),
    eng_E: n(row['מרכיב E\n27%'] ?? row['מרכיב E']),
    eng_F: n(row['מרכיב F\n26%'] ?? row['מרכיב F']),
    eng_G: n(row['מרכיב G\n27%'] ?? row['מרכיב G']),
    eng_boost: n(row['Boost\n20%'] ?? row['Boost']),
    eng_final: n(row['אנגלית\nציון\nסופי'] ?? row['אנגלית\nסופי'] ?? row['אנגלית ציון']),
    major_bio: n(row['ביולוגיה\nציון'] ?? row['ביולוגיה']),
    major_motal: n(row['מוט"ל\nציון'] ?? row['מוט"ל']),
    major_languages: n(row['שפות\nציון'] ?? row['שפות']),
    major_other: n(row['אחר\nציון'] ?? row['אחר']),
  })).filter(s => s.studentId && s.studentId !== 'undefined')

  const schoolGrades: SchoolGrades[] = schoolRaw.map((row) => ({
    studentId: String(row['תעודת זהות'] ?? row['ת"ז'] ?? ''),
    civics: n(row['אזרחות']),
    english: n(row['אנגלית']),
    history: n(row['היסטוריה']),
    hebrew: n(row['עברית'] ?? row["עב''ר"]),
    math: n(row['מתמטיקה']),
    bible: n(row['תנ"ך'] ?? row['תנך']),
    literature: n(row['ספרות']),
    pe: n(row['חינוך גופני']),
  })).filter(s => s.studentId && s.studentId !== 'undefined')

  return { students, bagrutScores, schoolGrades }
}
