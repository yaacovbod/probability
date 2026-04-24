export type Student = {
  id: string
  fullName: string
  classGroup: string
  isSpecialEd: boolean
  isLateJoinerLashon: boolean
  attendanceAbsencePct: number | null
  mathUnits: 3 | 4 | 5 | null
  englishUnits: 3 | 4 | 5 | null
  notes: string
}

export type BagrutScores = {
  studentId: string
  math_35173: number | null
  math_35371: number | null
  math_35372: number | null
  math_35471: number | null
  math_35472: number | null
  math_35571: number | null
  math_35572: number | null
  lashon_exam: number | null
  lashon_school: number | null
  history_online: number | null
  history_exam: number | null
  history_school: number | null
  tanach_online: number | null
  tanach_exam: number | null
  tanach_school: number | null
  civics_online: number | null
  civics_exam: number | null
  civics_school: number | null
  literature_online: number | null
  literature_exam: number | null
  literature_school: number | null
  eng_A: number | null
  eng_B: number | null
  eng_C: number | null
  eng_D: number | null
  eng_E: number | null
  eng_F: number | null
  eng_G: number | null
  eng_boost: number | null
  eng_final: number | null
  major_bio: number | null
  major_motal: number | null
  major_languages: number | null
  major_other: number | null
}

export type SchoolGrades = {
  studentId: string
  civics: number | null
  english: number | null
  history: number | null
  hebrew: number | null
  math: number | null
  bible: number | null
  literature: number | null
  pe: number | null
  major: number | null
  majorSubject: string | null
}

export type RiskLevel = 'גבוה מאוד' | 'גבוה' | 'בינוני' | 'נמוך מאוד'

export type SubjectProbs = {
  lashon: number | null
  tanach: number | null
  history: number | null
  civics: number | null
  literature: number | null
  english: number | null
  math: number | null
  major: number | null
}

export type ProbabilityResult = {
  score: number
  risk: RiskLevel
  subjectProbs: SubjectProbs
  breakdown: {
    bagrutDone: number
    schoolGrades: number
    mathEnglishLevel: number
    attendance: number
  }
}

export type StudentFullData = {
  student: Student
  bagrut: BagrutScores
  school: SchoolGrades
  result: ProbabilityResult
}

