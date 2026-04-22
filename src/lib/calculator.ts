import {
  Student, BagrutScores, SchoolGrades, Settings,
  ProbabilityResult, RiskLevel, DEFAULT_SETTINGS,
} from './types'

function isCohortDone(field: keyof BagrutScores, allScores: BagrutScores[]): boolean {
  const n = allScores.length
  if (n === 0) return false
  const count = allScores.filter(s => s[field] !== null && s[field] !== 0).length
  return count / n >= 0.50
}

function probLashon(
  exam: number | null,
  isSpecialEd: boolean,
  isLateJoiner: boolean,
  cohortDone: boolean,
  settings: Settings
): number | null {
  if (!exam || exam === 0) {
    if (isLateJoiner) return null
    if (isSpecialEd) return settings.specialEdLashonNoExam
    return cohortDone ? 0 : null
  }
  const final = exam * 0.70 + settings.guaranteedInternalGrade * 0.30
  if (final >= 60) return 100
  if (final >= 55) return 95
  if (final >= 52) return 70
  if (final >= 48) return 40
  if (final >= 44) return 15
  return 5
}

function probSpirit(
  exam: number | null,
  isSpecialEd: boolean,
  cohortDone: boolean,
  settings: Settings
): number | null {
  if (!exam || exam === 0) {
    if (isSpecialEd) return null
    return cohortDone ? 0 : null
  }
  const guaranteed =
    settings.guaranteedOnlineTasksGrade * 0.35 +
    settings.guaranteedInternalGrade * 0.30
  const final = exam * 0.35 + guaranteed
  if (final >= 60) return 100
  if (final >= 55) return 98
  if (final >= 52) return 80
  if (final >= 50) return 60
  return 30
}

function probHistory(
  exam: number | null,
  isSpecialEd: boolean,
  settings: Settings
): number | null {
  if (!exam || exam === 0) return null
  return probSpirit(exam, isSpecialEd, false, settings)
}

function scoreToProb(score: number): number {
  if (score >= 65) return 100
  if (score >= 55) return 85
  if (score >= 50) return 55
  return 20
}

function probMath(scores: BagrutScores, schoolMathGrade: number | null): number {
  if (scores.math_35571 !== null || scores.math_35572 !== null) {
    const s = (scores.math_35571 ?? 0) * 0.60 + (scores.math_35572 ?? 0) * 0.40
    return scoreToProb(s)
  }
  if (scores.math_35471 !== null || scores.math_35472 !== null) {
    const s = (scores.math_35471 ?? 0) * 0.65 + (scores.math_35472 ?? 0) * 0.35
    return scoreToProb(s)
  }
  if (
    scores.math_35173 !== null &&
    scores.math_35371 === null &&
    scores.math_35372 === null
  ) {
    const first = scores.math_35173
    if (first >= 85) return 85
    if (first >= 70) return 70
    if (first >= 55) return 55
    if (first >= 45) return 35
    return 15
  }
  if (
    scores.math_35173 !== null ||
    scores.math_35371 !== null ||
    scores.math_35372 !== null
  ) {
    const s =
      (scores.math_35173 ?? 0) * 0.25 +
      (scores.math_35371 ?? 0) * 0.35 +
      (scores.math_35372 ?? 0) * 0.40
    return scoreToProb(s)
  }
  if (schoolMathGrade === null) return 65
  if (schoolMathGrade >= 85) return 90
  if (schoolMathGrade >= 75) return 80
  if (schoolMathGrade >= 65) return 65
  if (schoolMathGrade >= 55) return 50
  return 35
}

function probEnglish(
  engFinal: number | null,
  cohortDone: boolean,
  schoolEnglishGrade: number | null
): number {
  if (!engFinal || engFinal === 0) {
    if (cohortDone) return 0
    if (schoolEnglishGrade === null) return 60
    if (schoolEnglishGrade >= 85) return 90
    if (schoolEnglishGrade >= 75) return 80
    if (schoolEnglishGrade >= 65) return 65
    if (schoolEnglishGrade >= 55) return 50
    return 30
  }
  if (engFinal >= 70) return 100
  if (engFinal >= 60) return 95
  if (engFinal >= 55) return 85
  if (engFinal >= 50) return 55
  if (engFinal >= 45) return 30
  return 10
}

function calcBagrutScore(probs: Record<string, number>): number {
  const values = Object.values(probs)
  if (values.length === 0) return 40
  const min = Math.min(...values)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  return min * 0.55 + avg * 0.45
}

function calcSchoolGradesScore(grades: SchoolGrades): number {
  const core = [grades.civics, grades.english, grades.history, grades.hebrew, grades.math, grades.bible]
  const valid = core.filter((g): g is number => g !== null)
  if (valid.length === 0) return 50
  const avg = valid.reduce((a, b) => a + b, 0) / valid.length
  if (avg >= 75) return 90
  if (avg >= 65) return 70
  if (avg >= 55) return 50
  return 25
}

function calcMathEnglishLevel(student: Student, bagrut: BagrutScores): number {
  let mathScore = 65
  if (bagrut.math_35571 || bagrut.math_35572) mathScore = 95
  else if (bagrut.math_35471 || bagrut.math_35472) mathScore = 80
  else if (bagrut.math_35173 || bagrut.math_35371 || bagrut.math_35372) mathScore = 60
  else if (student.mathUnits === 5) mathScore = 95
  else if (student.mathUnits === 4) mathScore = 80
  else if (student.mathUnits === 3) mathScore = 60

  let engScore = 60
  if (student.englishUnits === 5) engScore = 95
  else if (student.englishUnits === 4) engScore = 80

  return (mathScore + engScore) / 2
}

function calcAttendanceScore(absencePct: number | null): number {
  if (absencePct === null) return 70
  const presence = 100 - absencePct
  if (presence >= 80) return 100
  if (presence >= 75) return 85
  if (presence >= 70) return 70
  if (presence >= 65) return 50
  return 25
}

function getRiskLevel(score: number, thresholds: Settings['riskThresholds']): RiskLevel {
  if (score < thresholds.high) return 'גבוה מאוד'
  if (score < thresholds.medium) return 'גבוה'
  if (score < thresholds.low) return 'בינוני'
  return 'נמוך'
}

function buildRecommendations(
  student: Student,
  bagrut: BagrutScores,
  school: SchoolGrades,
  subjectProbs: Record<string, number>
): string[] {
  const recs: string[] = []
  const absence = student.attendanceAbsencePct
  if (absence !== null && 100 - absence < 75) {
    recs.push('נוכחות קריטית — פחות מ-75% נוכחות')
  }
  if (subjectProbs['לשון'] === 0) recs.push('לא הוגש לבגרות לשון')
  if (subjectProbs['תנ"ך'] === 0) recs.push('לא ניגש לבגרות תנ"ך')
  if (subjectProbs['היסטוריה'] === 0) recs.push('לא ניגש לבגרות היסטוריה')
  if (subjectProbs['אנגלית'] === 0) recs.push('לא הוגש לבגרות אנגלית')

  const core = [school.civics, school.english, school.history, school.hebrew, school.math, school.bible]
  const valid = core.filter((g): g is number => g !== null)
  if (valid.length > 0) {
    const avg = valid.reduce((a, b) => a + b, 0) / valid.length
    if (avg < 65) recs.push('ממוצע ציוני תעודה נמוך — מקצועות ליבה לחיזוק')
  }
  return recs
}

export function calculateProbability(
  student: Student,
  bagrut: BagrutScores,
  school: SchoolGrades,
  allBagrut: BagrutScores[],
  settings: Settings = DEFAULT_SETTINGS
): ProbabilityResult {
  try {
    const lashonDone = isCohortDone('lashon_exam', allBagrut)
    const tanachDone = isCohortDone('tanach_exam', allBagrut)
    const civicsDone = isCohortDone('civics_exam', allBagrut)
    const literatureDone = isCohortDone('literature_exam', allBagrut)
    const engDone = isCohortDone('eng_final', allBagrut)

    const subjectProbsRaw: Record<string, number | null> = {
      'לשון': probLashon(bagrut.lashon_exam, student.isSpecialEd, student.isLateJoinerLashon, lashonDone, settings),
      'תנ"ך': probSpirit(bagrut.tanach_exam, student.isSpecialEd, tanachDone, settings),
      'היסטוריה': probHistory(bagrut.history_exam, student.isSpecialEd, settings),
      'אזרחות': probSpirit(bagrut.civics_exam, student.isSpecialEd, civicsDone, settings),
      'ספרות': probSpirit(bagrut.literature_exam, student.isSpecialEd, literatureDone, settings),
      'אנגלית': probEnglish(bagrut.eng_final, engDone, school.english),
      'מתמטיקה': probMath(bagrut, school.math),
    }

    const subjectProbs: Record<string, number> = {}
    for (const [k, v] of Object.entries(subjectProbsRaw)) {
      if (v !== null) subjectProbs[k] = v
    }

    const s1 = calcBagrutScore(subjectProbs)
    const s2 = calcSchoolGradesScore(school)
    const s3 = calcMathEnglishLevel(student, bagrut)
    const s4 = calcAttendanceScore(student.attendanceAbsencePct)

    const score = Math.round(
      s1 * settings.weights.bagrutDone +
      s2 * settings.weights.schoolGrades +
      s3 * settings.weights.mathEnglishLevel +
      s4 * settings.weights.attendance
    )

    return {
      score: Math.min(100, Math.max(0, score)),
      risk: getRiskLevel(score, settings.riskThresholds),
      subjectProbs,
      breakdown: { bagrutDone: Math.round(s1), schoolGrades: Math.round(s2), mathEnglishLevel: Math.round(s3), attendance: Math.round(s4) },
      recommendations: buildRecommendations(student, bagrut, school, subjectProbs),
    }
  } catch {
    return {
      score: 50,
      risk: 'בינוני',
      subjectProbs: {},
      breakdown: { bagrutDone: 40, schoolGrades: 50, mathEnglishLevel: 65, attendance: 70 },
      recommendations: ['שגיאה בחישוב — בדוק נתונים'],
    }
  }
}
