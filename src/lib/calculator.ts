import { Student, BagrutScores, SchoolGrades, ProbabilityResult, RiskLevel } from './types'

const WEIGHTS = {
  bagrutDone: 0.50,
  schoolGrades: 0.20,
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
  veryHigh: 85,
  high: 70,
  medium: 45,
} as const

// Passing threshold for each subject formula (Israeli bagrut: final ≥ 55 = passing)
const PASS = {
  lashon: { safeExam: 35, lowRisk: 32, veryLow: 28, finalHigh: 60, finalMid: 57, finalLow: 54, finalBorder: 51 },
  spirit: { finalPass: 54.5, finalSafe: 60, borderFail: 52, veryLow: 48 },
  math: { highConfidence: 65, midConfidence: 55, borderConfidence: 50 },
} as const


function probFromReport(grade: number | null): number | null {
  if (grade === null) return null
  if (grade >= 85) return 90
  if (grade >= 75) return 80
  if (grade >= 65) return 65
  if (grade >= 55) return 50
  return 30
}

export function probLashon(
  exam: number | null,
  student: Student,
  schoolGrade: number | null = null,
  reportGrade: number | null = null
): number | null {
  if (exam === null) {
    if (student.isLateJoinerLashon) return null
    return probFromReport(reportGrade)
  }
  if (exam === 0) {
    if (student.isLateJoinerLashon) return null
    if (student.isSpecialEd) return GUARANTEED.specialEdLashon
    return 0
  }
  // below safeExam: even 100 internal cannot bring final to passing threshold
  if (exam < PASS.lashon.safeExam) {
    if (exam >= PASS.lashon.lowRisk) return 15
    if (exam >= PASS.lashon.veryLow) return 10
    return 5
  }

  // safeExam+: internal grade can rescue
  const internal = schoolGrade ?? GUARANTEED.internalGrade
  const final = exam * 0.70 + internal * 0.30
  if (final >= PASS.lashon.finalHigh) return 100
  if (final >= PASS.lashon.finalMid) return 95
  if (final >= PASS.lashon.finalLow) return 85
  if (final >= PASS.lashon.finalBorder) return 75
  return 70
}

export function probSpirit(
  exam: number | null,
  isSpecialEd: boolean,
  schoolGrade: number | null = null,
  onlineGrade: number | null = null,
  reportGrade: number | null = null
): number | null {
  if (exam === null) return probFromReport(reportGrade)
  if (exam === 0) {
    if (isSpecialEd) return null
    return 0
  }
  const internal = schoolGrade ?? GUARANTEED.internalGrade
  const online = onlineGrade ?? GUARANTEED.onlineTasks
  const final = exam * 0.35 + online * 0.35 + internal * 0.30
  if (final >= PASS.spirit.finalSafe) return 100
  if (final >= PASS.spirit.finalPass) return 95   // passes (54.5 rounds up to 55)
  if (final >= PASS.spirit.borderFail) return 25  // fails with defaults; small chance real grades are higher
  if (final >= PASS.spirit.veryLow) return 15
  return 5
}

export function probHistory(
  exam: number | null,
  isSpecialEd: boolean,
  schoolGrade: number | null = null,
  onlineGrade: number | null = null,
  reportGrade: number | null = null
): number | null {
  if (exam === null) return probFromReport(reportGrade)
  if (exam === 0) {
    if (isSpecialEd) return null
    return 0
  }
  return probSpirit(exam, false, schoolGrade, onlineGrade, reportGrade)
}

function engFinalFromComponents(scores: BagrutScores, units: 3 | 4 | 5 | null): number | null {
  // B (3-unit), D (4-unit), F (5-unit) are school-controlled → guaranteed ≥85
  if (units === 3) {
    return weightedNorm([
      [scores.eng_A,             0.27],
      [scores.eng_B ?? 85,       0.26],
      [scores.eng_C,             0.27],
      [scores.eng_boost,         0.20],
    ])
  }
  if (units === 4) {
    return weightedNorm([
      [scores.eng_C,             0.27],
      [scores.eng_D ?? 85,       0.26],
      [scores.eng_E,             0.27],
      [scores.eng_boost,         0.20],
    ])
  }
  if (units === 5) {
    return weightedNorm([
      [scores.eng_E,             0.27],
      [scores.eng_F ?? 85,       0.26],
      [scores.eng_G,             0.27],
      [scores.eng_boost,         0.20],
    ])
  }
  return null
}

function engScoreToProb(score: number): number {
  if (score >= 70) return 100
  if (score >= 55) return 95  // passed ≥55 — near-certain
  if (score >= 50) return 55
  if (score >= 45) return 30
  return 10
}

export function probEnglish(
  scores: BagrutScores,
  englishUnits: 3 | 4 | 5 | null,
  schoolEnglish: number | null
): number | null {
  const hasComponents = hasEngExam(scores)

  // Use inferred unit level if not explicitly provided
  const effectiveUnits = englishUnits ?? inferEnglishUnits(scores)

  // Compute from specific components based on unit level
  const computed = engFinalFromComponents(scores, effectiveUnits)
  if (computed !== null) return engScoreToProb(computed)

  // Sheet final is only reliable when NO individual components exist
  // (sheet formula returns a partial/wrong value when questionnaires are partially filled)
  if (!hasComponents && scores.eng_final !== null && scores.eng_final !== 0) {
    return engScoreToProb(scores.eng_final)
  }

  // No bagrut data — estimate from school grade
  if (schoolEnglish === null) return null
  if (schoolEnglish >= 85) return 90
  if (schoolEnglish >= 75) return 80
  if (schoolEnglish >= 65) return 65
  if (schoolEnglish >= 55) return 50
  return 30
}

function weightedNorm(parts: [number | null, number][]): number | null {
  const present = parts.filter(([v]) => v !== null) as [number, number][]
  if (present.length === 0) return null
  const totalW = present.reduce((s, [, w]) => s + w, 0)
  return present.reduce((s, [v, w]) => s + v * (w / totalW), 0)
}

function mathExamScore(scores: BagrutScores): number | null {
  if (scores.math_35571 !== null || scores.math_35572 !== null) {
    return weightedNorm([[scores.math_35571, 0.60], [scores.math_35572, 0.40]])
  }
  if (scores.math_35471 !== null || scores.math_35472 !== null) {
    return weightedNorm([[scores.math_35471, 0.65], [scores.math_35472, 0.35]])
  }
  if (scores.math_35173 !== null && scores.math_35371 === null && scores.math_35372 === null) {
    return null // handled separately by firstOnly branch in probMath
  }
  if (scores.math_35173 !== null || scores.math_35371 !== null || scores.math_35372 !== null) {
    return weightedNorm([
      [scores.math_35173, 0.25],
      [scores.math_35371, 0.35],
      [scores.math_35372, 0.40],
    ])
  }
  return null
}

function scoreToProbMath(score: number): number {
  if (score >= PASS.math.highConfidence) return 100
  if (score >= PASS.math.midConfidence) return 95  // passed ≥55 — near-certain
  if (score >= PASS.math.borderConfidence) return 55
  return 20
}

export function probMath(scores: BagrutScores, schoolMath: number | null): number {
  const firstOnly =
    scores.math_35173 !== null &&
    scores.math_35371 === null &&
    scores.math_35372 === null

  if (firstOnly) {
    const first = scores.math_35173!
    if (first >= 85) return 95  // strong first exam → very likely to pass
    if (first >= 70) return 80
    if (first >= 55) return 60
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

export function probMajor(scores: BagrutScores, schoolMajor: number | null = null): number | null {
  const majors = [
    scores.major_bio, scores.major_psychology, scores.major_physics, scores.major_data,
    scores.major_art, scores.major_communication, scores.major_chemistry,
    scores.major_cs, scores.major_business, scores.major_motal, scores.major_languages,
  ]
  const hasBagrutData = majors.some(m => m !== null && m > 0)

  if (hasBagrutData) {
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

  // no bagrut data yet — estimate from school grade
  if (schoolMajor === null) return null
  if (schoolMajor >= 85) return 90
  if (schoolMajor >= 75) return 80
  if (schoolMajor >= 65) return 65
  if (schoolMajor >= 55) return 50
  return 30
}

function calcS1(
  student: Student,
  scores: BagrutScores,
  grades: SchoolGrades
): { s1: number; subjectProbs: ProbabilityResult['subjectProbs'] } {
  const sp: ProbabilityResult['subjectProbs'] = {
    lashon: probLashon(scores.lashon_exam, student, scores.lashon_school, grades.hebrew),
    tanach: probSpirit(scores.tanach_exam, student.isSpecialEd, scores.tanach_school, scores.tanach_online, grades.bible),
    history: probHistory(scores.history_exam, student.isSpecialEd, scores.history_school, scores.history_online, grades.history),
    civics: probSpirit(scores.civics_exam, student.isSpecialEd, scores.civics_school, scores.civics_online, grades.civics),
    literature: probSpirit(scores.literature_exam, student.isSpecialEd, scores.literature_school, scores.literature_online, grades.literature),
    english: probEnglish(scores, student.englishUnits, grades.english),
    math: probMath(scores, grades.math),
    major: probMajor(scores, grades.major),
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
  const s1 = normalizedAvg

  return { s1, subjectProbs: sp }
}

function inferEnglishUnits(scores: BagrutScores): 3 | 4 | 5 | null {
  if (scores.eng_F !== null || scores.eng_G !== null) return 5
  if (scores.eng_D !== null || scores.eng_E !== null) return 4
  if (scores.eng_A !== null || scores.eng_B !== null || scores.eng_C !== null) return 3
  return null
}

function hasEngExam(scores: BagrutScores): boolean {
  return [
    scores.eng_A, scores.eng_B, scores.eng_C, scores.eng_D,
    scores.eng_E, scores.eng_F, scores.eng_G, scores.eng_boost,
  ].some(v => v !== null)
}

function hasMathExam(scores: BagrutScores): boolean {
  return (
    scores.math_35173 !== null ||
    scores.math_35371 !== null || scores.math_35372 !== null ||
    scores.math_35471 !== null || scores.math_35472 !== null ||
    scores.math_35571 !== null || scores.math_35572 !== null
  )
}

function calcS2(grades: SchoolGrades, scores: BagrutScores): number {
  const subjectGrades: (number | null)[] = [
    grades.hebrew,
    hasMathExam(scores) ? null : grades.math,
    hasEngExam(scores) ? null : grades.english,
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

  let engUnitScore = 50
  if (student.englishUnits === 5) engUnitScore = 95
  else if (student.englishUnits === 4) engUnitScore = 80
  else if (student.englishUnits === 3) engUnitScore = 50

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
  if (score >= RISK_THRESHOLDS.veryHigh) risk = 'גבוה מאוד'
  else if (score >= RISK_THRESHOLDS.high) risk = 'גבוה'
  else if (score >= RISK_THRESHOLDS.medium) risk = 'בינוני'
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
