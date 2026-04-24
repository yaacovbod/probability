import { BagrutScores, SubjectProbs } from './types'

export type ExamEntry = {
  subject: keyof SubjectProbs
  label: string
  date: Date
  title: string
  round: 'א' | 'ב'
  bagrutField?: keyof BagrutScores
  schoolMajorKey?: string
}

// Derived from exam11/events-read.txt (category: בגרות), mapped to subjectProbs keys
export const EXAM_SCHEDULE: ExamEntry[] = [
  { subject: 'lashon',     label: 'לשון',         date: new Date('2026-05-07'), title: 'בגרות בלשון',              round: 'א' },
  { subject: 'math',       label: 'מתמטיקה',     date: new Date('2026-05-12'), title: 'בגרות במתמטיקה (3-4 יח"ל)', round: 'א' },
  { subject: 'math',       label: 'מתמטיקה',     date: new Date('2026-05-13'), title: 'בגרות במתמטיקה (5 יח"ל)',   round: 'א' },
  { subject: 'english',    label: 'אנגלית',       date: new Date('2026-05-18'), title: 'בגרות באנגלית (3+5 יח"ל)', round: 'א' },
  { subject: 'english',    label: 'אנגלית',       date: new Date('2026-05-19'), title: 'בגרות באנגלית (4 יח"ל)',   round: 'א' },
  { subject: 'major', label: 'ניהול עסקי',   date: new Date('2026-06-04'), title: 'בגרות בניהול עסקי',   round: 'א', bagrutField: 'major_business',      schoolMajorKey: 'ניהול עסקי' },
  { subject: 'major', label: 'מוטל',         date: new Date('2026-06-15'), title: 'בגרות במוטל',         round: 'א', bagrutField: 'major_motal',         schoolMajorKey: 'מוטל' },
  { subject: 'major', label: 'פיזיקה',       date: new Date('2026-06-15'), title: 'בגרות בפיזיקה',       round: 'א', bagrutField: 'major_physics',       schoolMajorKey: 'פיזיקה' },
  { subject: 'literature', label: 'ספרות',   date: new Date('2026-06-17'), title: 'בגרות בספרות',                    round: 'א' },
  { subject: 'major', label: 'פסיכולוגיה',   date: new Date('2026-06-22'), title: 'בגרות בפסיכולוגיה',   round: 'א', bagrutField: 'major_psychology',    schoolMajorKey: 'פסיכולוגיה' },
  { subject: 'major', label: 'מידע ונתונים', date: new Date('2026-06-25'), title: 'בגרות במידע ונתונים', round: 'א', bagrutField: 'major_data',          schoolMajorKey: 'מידע ונתונים' },
  { subject: 'major', label: 'מדעי המחשב',   date: new Date('2026-06-25'), title: 'בגרות במדעי המחשב',   round: 'א', bagrutField: 'major_cs',            schoolMajorKey: 'מדעי המחשב' },
  { subject: 'english',    label: 'אנגלית',       date: new Date('2026-06-30'), title: 'בגרות באנגלית',             round: 'ב' },
  { subject: 'math',       label: 'מתמטיקה',     date: new Date('2026-07-06'), title: 'בגרות במתמטיקה',            round: 'ב' },
  { subject: 'lashon',     label: 'לשון',         date: new Date('2026-07-09'), title: 'בגרות בלשון',              round: 'ב' },
]

export function daysUntil(date: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}
