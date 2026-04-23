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

export function parseStudentRow(row: Record<string, unknown>): Student {
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
  }
}

export function parseSchoolGradesRow(row: Record<string, unknown>): SchoolGrades {
  return {
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
  }
}
