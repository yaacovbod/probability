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
}

export type Settings = {
  weights: {
    bagrutDone: number
    schoolGrades: number
    mathEnglishLevel: number
    attendance: number
  }
  bagrutSubWeights: {
    lashon: number
    tanach: number
    other: number
  }
  guaranteedInternalGrade: number
  guaranteedOnlineTasksGrade: number
  specialEdLashonNoExam: number
  riskThresholds: {
    veryHigh: number
    high: number
    medium: number
    low: number
  }
}

export const DEFAULT_SETTINGS: Settings = {
  weights: {
    bagrutDone: 0.55,
    schoolGrades: 0.15,
    mathEnglishLevel: 0.10,
    attendance: 0.20,
  },
  bagrutSubWeights: {
    lashon: 0.50,
    tanach: 0.30,
    other: 0.20,
  },
  guaranteedInternalGrade: 85,
  guaranteedOnlineTasksGrade: 70,
  specialEdLashonNoExam: 80,
  riskThresholds: {
    veryHigh: 0,
    high: 45,
    medium: 65,
    low: 80,
  },
}

export type RiskLevel = 'גבוה מאוד' | 'גבוה' | 'בינוני' | 'נמוך'

export type ProbabilityResult = {
  score: number
  risk: RiskLevel
  subjectProbs: Partial<Record<string, number>>
  breakdown: {
    bagrutDone: number
    schoolGrades: number
    mathEnglishLevel: number
    attendance: number
  }
  recommendations: string[]
}

export type StudentFullData = {
  student: Student
  bagrut: BagrutScores
  school: SchoolGrades
  result: ProbabilityResult
}
