import { Student, BagrutScores, SchoolGrades, ProbabilityResult, RiskLevel } from './types'

const WEIGHTS = {
  bagrutDone: 0.55,
  schoolGrades: 0.15,
  mathEnglishLevel: 0.10,
  attendance: 0.20,
} as const

const BAGRUT_SUB_WEIGHTS = {
  lashon: 0.50,
  tanach: 0.30,
  other: 0.20,
} as const

const GUARANTEED = {
  internalGrade: 85,
  onlineTasks: 70,
  specialEdLashon: 80,
} as const

const RISK_THRESHOLDS = {
  low: 80,
  medium: 65,
  high: 45,
} as const


export function probLashon(
  exam: number | null,
  student: Student,
  schoolGrade: number | null = null
): number | null {
  if (exam === null) return null
  if (exam === 0) {
    if (student.isLateJoinerLashon) return null
    if (student.isSpecialEd) return GUARANTEED.specialEdLashon
    return 0
  }
  const internal = schoolGrade ?? GUARANTEED.internalGrade
  const final = exam * 0.70 + internal * 0.30
  if (final >= 60) return 100
  if (final >= 55) return 95
  if (final >= 52) return 70
  if (final >= 48) return 40
  if (final >= 44) return 15
  return 5
}

export function probSpirit(
  exam: number | null,
  isSpecialEd: boolean,
  schoolGrade: number | null = null,
  onlineGrade: number | null = null
): number | null {
  if (exam === null) return null
  if (exam === 0) {
    if (isSpecialEd) return null
    return 0
  }
  const internal = schoolGrade ?? GUARANTEED.internalGrade
  const online = onlineGrade ?? GUARANTEED.onlineTasks
  const final = exam * 0.35 + online * 0.35 + internal * 0.30
  if (final >= 60) return 100
  if (final >= 55) return 98
  if (final >= 52) return 80
  if (final >= 50) return 60
  return 30
}

export function probHistory(
  exam: number | null,
  isSpecialEd: boolean,
  schoolGrade: number | null = null,
  onlineGrade: number | null = null
): number | null {
  if (exam === null) return null
  if (exam === 0) {
    if (isSpecialEd) return null
    return 0
  }
  if (isSpecialEd) return null
  return probSpirit(exam, false, schoolGrade, onlineGrade)
}

export function probEnglish(
  engFinal: number | null,
  schoolEnglish: number | null
): number | null {
  if (engFinal === null) {
    if (schoolEnglish === null) return null
    if (schoolEnglish >= 85) return 90
    if (schoolEnglish >= 75) return 80
    if (schoolEnglish >= 65) return 65
    if (schoolEnglish >= 55) return 50
    return 30
  }
  if (engFinal === 0) return 0
  if (engFinal >= 70) return 100
  if (engFinal >= 60) return 95
  if (engFinal >= 55) return 85
  if (engFinal >= 50) return 55
  if (engFinal >= 45) return 30
  return 10
}

function mathExamScore(scores: BagrutScores): number | null {
  if (scores.math_35571 !== null || scores.math_35572 !== null) {
    return (scores.math_35571 ?? 0) * 0.60 + (scores.math_35572 ?? 0) * 0.40
  }
  if (scores.math_35471 !== null || scores.math_35472 !== null) {
    return (scores.math_35471 ?? 0) * 0.65 + (scores.math_35472 ?? 0) * 0.35
  }
  if (scores.math_35173 !== null && scores.math_35371 === null && scores.math_35372 === null) {
    return null
  }
  if (scores.math_35173 !== null || scores.math_35371 !== null || scores.math_35372 !== null) {
    return (
      (scores.math_35173 ?? 0) * 0.25 +
      (scores.math_35371 ?? 0) * 0.35 +
      (scores.math_35372 ?? 0) * 0.40
    )
  }
  return null
}

function scoreToProbMath(score: number): number {
  if (score >= 65) return 100
  if (score >= 55) return 85
  if (score >= 50) return 55
  return 20
}

export function probMath(scores: BagrutScores, schoolMath: number | null): number {
  const firstOnly =
    scores.math_35173 !== null &&
    scores.math_35371 === null &&
    scores.math_35372 === null

  if (firstOnly) {
    const first = scores.math_35173!
    if (first >= 85) return 85
    if (first >= 70) return 70
    if (first >= 55) return 55
    if (first >= 45) return 35
    return 15
  }

  const score = mathExamScore(scores)
  if (score !== null) return scoreToProbMath(score)

  if (schoolMath === null) return 65
  if (schoolMath >= 85) return 90
  if (schoolMath >= 75) return 80
  if (schoolMath >= 65) return 65
  if (schoolMath >= 55) return 50
  return 35
}

export function probMajor(scores: BagrutScores): number | null {
  const majors = [scores.major_bio, scores.major_motal, scores.major_languages, scores.major_other]
  const hasMajorData = majors.some(m => m !== null)
  if (!hasMajorData) return null

  let bestProb: number | null = null
  for (const m of majors) {
    if (m === null || m === 0) continue
    const p = m >= 70 ? 95 : m >= 60 ? 85 : m >= 55 ? 75 : m >= 50 ? 50 : 20
    if (bestProb === null || p > bestProb) bestProb = p
  }

  const allExplicitZero = majors.every(m => m === null || m === 0)
  const anyZero = majors.some(m => m === 0)
  if (allExplicitZero && anyZero) return 0

  return bestProb
}

function calcS1(
  student: Student,
  scores: BagrutScores,
  grades: SchoolGrades
): { s1: number; subjectProbs: ProbabilityResult['subjectProbs'] } {
  const hasEngComponents = [scores.eng_A, scores.eng_B, scores.eng_C, scores.eng_D,
    scores.eng_E, scores.eng_F, scores.eng_G, scores.eng_boost].some(v => v !== null)
  const engFinal = (scores.eng_final === 0 && !hasEngComponents) ? null : scores.eng_final

  const sp: ProbabilityResult['subjectProbs'] = {
    lashon: probLashon(scores.lashon_exam, student, scores.lashon_school),
    tanach: probSpirit(scores.tanach_exam, student.isSpecialEd, scores.tanach_school, scores.tanach_online),
    history: probHistory(scores.history_exam, student.isSpecialEd, scores.history_school, scores.history_online),
    civics: probSpirit(scores.civics_exam, student.isSpecialEd, scores.civics_school, scores.civics_online),
    literature: probSpirit(scores.literature_exam, student.isSpecialEd, scores.literature_school, scores.literature_online),
    english: probEnglish(engFinal, grades.english),
    math: probMath(scores, grades.math),
    major: probMajor(scores),
  }

  const weighted: Array<{ prob: number; weight: number }> = []

  if (sp.lashon !== null) weighted.push({ prob: sp.lashon, weight: BAGRUT_SUB_WEIGHTS.lashon })
  if (sp.tanach !== null) weighted.push({ prob: sp.tanach, weight: BAGRUT_SUB_WEIGHTS.tanach })

  const others: number[] = []
  if (sp.history !== null) others.push(sp.history)
  if (sp.civics !== null) others.push(sp.civics)
  if (sp.literature !== null) others.push(sp.literature)
  if (sp.major !== null) others.push(sp.major)
  if (others.length > 0) {
    const avgOthers = others.reduce((a, b) => a + b, 0) / others.length
    weighted.push({ prob: avgOthers, weight: BAGRUT_SUB_WEIGHTS.other })
  }

  if (sp.english !== null) weighted.push({ prob: sp.english, weight: 0.15 })
  if (sp.math !== null) weighted.push({ prob: sp.math, weight: 0.15 })

  if (weighted.length === 0) return { s1: 40, subjectProbs: sp }

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0)
  const normalizedAvg = weighted.reduce((sum, w) => sum + w.prob * (w.weight / totalWeight), 0)
  const minProb = Math.min(...weighted.map(w => w.prob))
  const s1 = minProb * 0.55 + normalizedAvg * 0.45

  return { s1, subjectProbs: sp }
}

function hasMathExam(scores: BagrutScores): boolean {
  return (
    scores.math_35371 !== null || scores.math_35372 !== null ||
    scores.math_35471 !== null || scores.math_35472 !== null ||
    scores.math_35571 !== null || scores.math_35572 !== null
  )
}

function calcS2(grades: SchoolGrades, scores: BagrutScores): number {
  const subjectGrades: (number | null)[] = [
    grades.hebrew,
    hasMathExam(scores) ? null : grades.math,
    scores.eng_final ? null : grades.english,
    scores.history_exam ? null : grades.history,
    scores.tanach_exam ? null : grades.bible,
    scores.civics_exam ? null : grades.civics,
  ]
  const valid = subjectGrades.filter((g): g is number => g !== null)
  if (valid.length === 0) return 50
  const avg = valid.reduce((a, b) => a + b, 0) / valid.length
  if (avg >= 75) return 90
  if (avg >= 65) return 70
  if (avg >= 55) return 50
  return 25
}

function calcS3(student: Student, scores: BagrutScores): number {
  let mathUnitScore = 65
  if (scores.math_35571 !== null || scores.math_35572 !== null) mathUnitScore = 95
  else if (scores.math_35471 !== null || scores.math_35472 !== null) mathUnitScore = 80
  else if (scores.math_35173 !== null || scores.math_35371 !== null || scores.math_35372 !== null) mathUnitScore = 60
  else if (student.mathUnits === 5) mathUnitScore = 95
  else if (student.mathUnits === 4) mathUnitScore = 80
  else if (student.mathUnits === 3) mathUnitScore = 60

  let engUnitScore = 60
  if (student.englishUnits === 5) engUnitScore = 95
  else if (student.englishUnits === 4) engUnitScore = 80

  return (mathUnitScore + engUnitScore) / 2
}

function calcS4(absencePct: number | null): number {
  if (absencePct === null) return 70
  const presence = 100 - absencePct
  if (presence >= 80) return 100
  if (presence >= 75) return 85
  if (presence >= 70) return 70
  if (presence >= 65) return 50
  return 25
}

export function calculateProbability(
  student: Student,
  scores: BagrutScores,
  grades: SchoolGrades
): ProbabilityResult {
  const { s1, subjectProbs } = calcS1(student, scores, grades)
  const s2 = calcS2(grades, scores)
  const s3 = calcS3(student, scores)
  const s4 = calcS4(student.attendanceAbsencePct)

  const raw =
    s1 * WEIGHTS.bagrutDone +
    s2 * WEIGHTS.schoolGrades +
    s3 * WEIGHTS.mathEnglishLevel +
    s4 * WEIGHTS.attendance

  const score = Math.min(100, Math.max(0, Math.round(raw * 10) / 10))

  let risk: RiskLevel
  if (score >= RISK_THRESHOLDS.low) risk = 'גבוה'
  else if (score >= RISK_THRESHOLDS.medium) risk = 'בינוני'
  else if (score >= RISK_THRESHOLDS.high) risk = 'נמוך'
  else risk = 'נמוך מאוד'

  return {
    score,
    risk,
    subjectProbs,
    breakdown: {
      bagrutDone: Math.round(s1 * 10) / 10,
      schoolGrades: Math.round(s2 * 10) / 10,
      mathEnglishLevel: Math.round(s3 * 10) / 10,
      attendance: Math.round(s4 * 10) / 10,
    },
  }
}
