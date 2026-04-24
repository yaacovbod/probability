import { SubjectProbs } from './types'

export type ExamEntry = {
  subject: keyof SubjectProbs
  label: string
  date: Date
  title: string
  round: 'א' | 'ב'
}

// Derived from exam11/events-read.txt (category: בגרות), mapped to subjectProbs keys
export const EXAM_SCHEDULE: ExamEntry[] = [
  { subject: 'lashon',     label: 'לשון',       date: new Date('2026-05-07'), title: 'בגרות בלשון',              round: 'א' },
  { subject: 'math',       label: 'מתמטיקה',   date: new Date('2026-05-12'), title: 'בגרות במתמטיקה (3-4 יח"ל)', round: 'א' },
  { subject: 'math',       label: 'מתמטיקה',   date: new Date('2026-05-13'), title: 'בגרות במתמטיקה (5 יח"ל)',   round: 'א' },
  { subject: 'english',    label: 'אנגלית',     date: new Date('2026-05-18'), title: 'בגרות באנגלית (3+5 יח"ל)', round: 'א' },
  { subject: 'english',    label: 'אנגלית',     date: new Date('2026-05-19'), title: 'בגרות באנגלית (4 יח"ל)',   round: 'א' },
  { subject: 'major',      label: 'מגמה',       date: new Date('2026-06-04'), title: 'בגרות בניהול עסקי',         round: 'א' },
  { subject: 'major',      label: 'מגמה',       date: new Date('2026-06-15'), title: 'בגרות במוטל',               round: 'א' },
  { subject: 'major',      label: 'מגמה',       date: new Date('2026-06-15'), title: 'בגרות בפיזיקה',             round: 'א' },
  { subject: 'literature', label: 'ספרות',      date: new Date('2026-06-17'), title: 'בגרות בספרות',              round: 'א' },
  { subject: 'major',      label: 'מגמה',       date: new Date('2026-06-22'), title: 'בגרות בפסיכולוגיה',         round: 'א' },
  { subject: 'major',      label: 'מגמה',       date: new Date('2026-06-25'), title: 'בגרות במידע ונתונים',        round: 'א' },
  { subject: 'major',      label: 'מגמה',       date: new Date('2026-06-25'), title: 'בגרות במדעי המחשב',         round: 'א' },
  { subject: 'english',    label: 'אנגלית',     date: new Date('2026-06-30'), title: 'בגרות באנגלית',             round: 'ב' },
  { subject: 'math',       label: 'מתמטיקה',   date: new Date('2026-07-06'), title: 'בגרות במתמטיקה',            round: 'ב' },
  { subject: 'lashon',     label: 'לשון',       date: new Date('2026-07-09'), title: 'בגרות בלשון',              round: 'ב' },
]

export function daysUntil(date: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}
