import { NextResponse } from 'next/server'
import { fetchSheetsData } from '@/lib/sheets'
import { calculateProbability } from '@/lib/calculator'
import { BagrutScores, SchoolGrades, StudentFullData } from '@/lib/types'

const emptyBagrut = (id: string): BagrutScores => ({
  studentId: id,
  math_35173: null, math_35371: null, math_35372: null,
  math_35471: null, math_35472: null, math_35571: null, math_35572: null,
  lashon_exam: null, lashon_school: null,
  history_online: null, history_exam: null, history_school: null,
  tanach_online: null, tanach_exam: null, tanach_school: null,
  civics_online: null, civics_exam: null, civics_school: null,
  literature_online: null, literature_exam: null, literature_school: null,
  eng_A: null, eng_B: null, eng_C: null, eng_D: null,
  eng_E: null, eng_F: null, eng_G: null, eng_boost: null, eng_final: null,
  major_bio: null, major_motal: null, major_languages: null, major_other: null,
})

const emptySchool = (id: string): SchoolGrades => ({
  studentId: id,
  civics: null, english: null, history: null, hebrew: null,
  math: null, bible: null, literature: null, pe: null,
})

export async function GET() {
  try {
    const { students, bagrutScores, schoolGrades } = await fetchSheetsData()

    const bagrutMap = new Map<string, BagrutScores>(bagrutScores.map(b => [b.studentId, b]))
    const schoolMap = new Map<string, SchoolGrades>(schoolGrades.map(s => [s.studentId, s]))

    const data: StudentFullData[] = students.map(student => {
      const bagrut = bagrutMap.get(student.id) ?? emptyBagrut(student.id)
      const school = schoolMap.get(student.id) ?? emptySchool(student.id)
      const result = calculateProbability(student, bagrut, school)
      return { student, bagrut, school, result }
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Google Sheets error:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת הנתונים מ-Google Sheets' }, { status: 500 })
  }
}
