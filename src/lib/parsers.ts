import { Student, SchoolGrades } from './types'

export function n(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null
  const num = Number(String(val).replace('%', '').trim())
  return isNaN(num) ? null : num
}

export function bool(val: unknown): boolean {
  if (!val) return false
  return String(val).trim() === 'כן' || val === true || val === 1
}

const MAJOR_NAME_MAP: Record<string, string> = {
  'ניהול עסקי ויזמות': 'ניהול עסקי',
  'ניהול עסקי - יזמות': 'ניהול עסקי',
  'מוט"ל': 'מוטל',
}

function normalizeMajorName(raw: string | null): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  return (MAJOR_NAME_MAP[trimmed] ?? trimmed) || null
}

export function parseStudentRow(row: Record<string, unknown>): Student {
  const rawMajor = String(row['מגמה'] ?? row['מגמת לימוד'] ?? row['מגמה/מסלול'] ?? '').trim()
  return {
    id: String(row['תעודת זהות'] ?? row['ת"ז'] ?? row['תז'] ?? ''),
    fullName: String(row['שם מלא'] ?? ''),
    classGroup: String(row['כיתה'] ?? ''),
    isSpecialEd: bool(row['חינוך מיוחד'] ?? row['חינ"מ'] ?? row['חינמ']),
    isLateJoinerLashon: bool(row['הצטרף מאוחר (לשון)'] ?? row['הצטרף מאוחר']),
    attendanceAbsencePct: n(row['אחוז היעדרויות'] ?? row['אחוז היעדרות'] ?? row['היעדרות %']),
    mathUnits: n(row['יח"ל מתמטיקה'] ?? row['יח"ל מת']) as 3 | 4 | 5 | null,
    englishUnits: n(row['יח"ל אנגלית'] ?? row['יח"ל אנג']) as 3 | 4 | 5 | null,
    notes: String(row['הערות'] ?? ''),
    majorName: normalizeMajorName(rawMajor || null),
  }
}

export function parseSchoolGradesRow(row: Record<string, unknown>): SchoolGrades {
  const pickFirst = (...keys: string[]): number | null => {
    for (const k of keys) {
      const v = n(row[k])
      if (v !== null) return v
    }
    return null
  }
  const englishLevel: 3 | 4 | 5 | null =
    pickFirst('אנגלית 5 יח"ל', 'אנגלית 5 יח"ל_1', 'אנגלית 5 יח"ל_2') !== null ? 5 :
    n(row['אנגלית 4 יח"ל']) !== null ? 4 :
    n(row['אנגלית']) !== null ? 3 : null

  const mathLevel: 3 | 4 | 5 | null =
    n(row['מתמטיקה 5 יח"ל']) !== null ? 5 :
    n(row['מתמטיקה 4 יח"ל']) !== null ? 4 :
    n(row['מתמטיקה 3 יח"ל']) !== null ? 3 : null

  return {
    studentId: String(row['ת.ז'] ?? row['תעודת זהות'] ?? row['ת"ז'] ?? ''),
    civics: n(row['אזרחות']),
    english: pickFirst('אנגלית 5 יח"ל', 'אנגלית 5 יח"ל_1', 'אנגלית 5 יח"ל_2', 'אנגלית 4 יח"ל', 'אנגלית'),
    englishLevel,
    history: n(row['היסטוריה']),
    hebrew: n(row['לשון'] ?? row['עברית'] ?? row["עב''ר"]),
    math: n(row['מתמטיקה 5 יח"ל'] ?? row['מתמטיקה 4 יח"ל'] ?? row['מתמטיקה 3 יח"ל'] ?? row['מתמטיקה']),
    mathLevel,
    bible: n(row['תנ"ך'] ?? row['תנך']),
    literature: n(row['ספרות']),
    pe: n(row['חינוך גופני'] ?? row['חינוך גופני בנות'] ?? row['חינוך גופני בנים']),
    major: (() => {
      const entries: [string, number | null][] = [
        ['ביולוגיה', n(row['ביולוגיה'])],
        ['אומנות', n(row['אומנות'])],
        ['מדעי המחשב', n(row['מדעי המחשב'])],
        ['מידע ונתונים', n(row['מידע ונתונים'])],
        ['ניהול עסקי', n(row['ניהול עסקי']) ?? n(row['ניהול עסקי - יזמות']) ?? n(row['ניהול עסקי ויזמות'])],
        ['פיזיקה', n(row['פיזיקה'])],
        ['פסיכולוגיה', n(row['פסיכולוגיה'])],
        ['תקשורת', n(row['תקשורת'])],
      ]
      const withGrade = entries.filter(([, v]) => v !== null) as [string, number][]
      return withGrade.length > 0 ? Math.max(...withGrade.map(([, v]) => v)) : null
    })(),
    majorSubject: (() => {
      const entries: [string, number | null][] = [
        ['ביולוגיה', n(row['ביולוגיה'])],
        ['אומנות', n(row['אומנות'])],
        ['מדעי המחשב', n(row['מדעי המחשב'])],
        ['מידע ונתונים', n(row['מידע ונתונים'])],
        ['ניהול עסקי', n(row['ניהול עסקי']) ?? n(row['ניהול עסקי - יזמות']) ?? n(row['ניהול עסקי ויזמות'])],
        ['פיזיקה', n(row['פיזיקה'])],
        ['פסיכולוגיה', n(row['פסיכולוגיה'])],
        ['תקשורת', n(row['תקשורת'])],
      ]
      const found = entries.find(([, v]) => v !== null)
      return found ? found[0] : null
    })(),
  }
}
