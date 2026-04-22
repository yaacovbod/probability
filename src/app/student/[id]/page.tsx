'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Student, BagrutScores, SchoolGrades, StudentFullData } from '@/lib/types'
import { calculateProbability, calcCohortFlags } from '@/lib/calculator'
import { localStorageAdapter } from '@/lib/storage'
import { Gauge } from '@/components/Gauge'
import { SubjectBar } from '@/components/SubjectBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const RISK_COLORS: Record<string, string> = {
  'נמוך': 'bg-green-100 text-green-800',
  'בינוני': 'bg-yellow-100 text-yellow-800',
  'גבוה': 'bg-orange-100 text-orange-800',
  'גבוה מאוד': 'bg-red-100 text-red-800',
}

export default function StudentPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [fullData, setFullData] = useState<StudentFullData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [students, bagrutScores, schoolGrades] = await Promise.all([
        localStorageAdapter.getStudents(),
        localStorageAdapter.getBagrutScores(),
        localStorageAdapter.getSchoolGrades(),
      ])

      const student = students.find((s: Student) => s.id === id)
      if (!student) { setLoading(false); return }

      const bagrut = bagrutScores.find((b: BagrutScores) => b.studentId === id) ?? emptyBagrut(id)
      const school = schoolGrades.find((s: SchoolGrades) => s.studentId === id) ?? emptySchool(id)
      const cohortFlags = calcCohortFlags(bagrutScores)
      const result = calculateProbability(student, bagrut, school, cohortFlags)
      setFullData({ student, bagrut, school, result })
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div dir="rtl" className="p-8 text-gray-500">טוען...</div>
  if (!fullData) return <div dir="rtl" className="p-8 text-red-500">תלמיד לא נמצא</div>

  const { student, bagrut, school, result } = fullData
  const absence = student.attendanceAbsencePct
  const presence = absence !== null ? Math.round(100 - absence) : null

  const breakdown = [
    { label: 'ציוני בגרויות שנעשו', value: result.breakdown.bagrutDone, weight: '55%' },
    { label: 'ציוני תעודה', value: result.breakdown.schoolGrades, weight: '15%' },
    { label: 'רמת מתמטיקה + אנגלית', value: result.breakdown.mathEnglishLevel, weight: '10%' },
    { label: 'נוכחות', value: result.breakdown.attendance, weight: '20%' },
  ]

  const SUBJECT_LABELS: Record<string, string> = {
    lashon: 'לשון',
    tanach: 'תנ"ך',
    history: 'היסטוריה',
    civics: 'אזרחות',
    literature: 'ספרות',
    english: 'אנגלית',
    math: 'מתמטיקה',
    major: 'מגמה',
  }
  const subjects = (Object.entries(result.subjectProbs) as [string, number | null][])
    .filter(([, v]) => v !== null)
    .map(([k, v]) => ({ name: SUBJECT_LABELS[k] ?? k, prob: v as number }))

  const schoolSubjects: { label: string; value: number | null }[] = [
    { label: 'מתמטיקה', value: school.math },
    { label: 'אנגלית', value: school.english },
    { label: 'היסטוריה', value: school.history },
    { label: 'עברית', value: school.hebrew },
    { label: 'תנ"ך', value: school.bible },
    { label: 'אזרחות', value: school.civics },
    { label: 'ספרות', value: school.literature },
  ]

  return (
    <main dir="rtl" className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.back()}>← חזרה</Button>
        <div>
          <h1 className="text-2xl font-bold">
            {student.fullName}
            {student.isSpecialEd && <span className="text-yellow-500 mr-2">★</span>}
          </h1>
          <p className="text-gray-500 text-sm">{student.classGroup} | ת"ז: {student.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col items-center py-6">
          <Gauge score={result.score} size={200} />
          <div className="mt-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${RISK_COLORS[result.risk]}`}>
              סיכון {result.risk}
            </span>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">פירוט רכיבים</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {breakdown.map(b => (
              <SubjectBar key={b.label} label={b.label} value={b.value} weight={b.weight} />
            ))}
          </CardContent>
        </Card>
      </div>

      {subjects.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">סיכויי מקצועות</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {subjects.map(({ name, prob: p }) => (
              <div key={name} className="flex items-center gap-2">
                <span className="w-24 text-sm text-right shrink-0 text-gray-700">{name}</span>
                <div className="flex-1 h-4 bg-gray-100 rounded-sm overflow-hidden">
                  <div
                    className={`h-full transition-all ${p >= 80 ? 'bg-green-500' : p >= 60 ? 'bg-yellow-400' : p >= 40 ? 'bg-orange-400' : 'bg-red-500'}`}
                    style={{ width: `${p}%` }}
                  />
                </div>
                <span className={`w-10 text-sm font-bold text-left shrink-0 ${p >= 80 ? 'text-green-600' : p >= 60 ? 'text-yellow-600' : p >= 40 ? 'text-orange-500' : 'text-red-600'}`}>
                  {p}%
                </span>
                <span className={`text-xs w-10 shrink-0 ${p >= 60 ? 'text-green-600' : 'text-red-500'}`}>{p >= 60 ? 'עובר' : 'בסיכון'}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">ציוני תעודה</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {schoolSubjects.filter(s => s.value !== null).map(s => (
              <div key={s.label} className="flex justify-between text-sm">
                <span className="text-gray-600">{s.label}</span>
                <span className={`font-semibold ${(s.value ?? 0) < 55 ? 'text-red-600' : (s.value ?? 0) < 65 ? 'text-orange-500' : 'text-gray-800'}`}>
                  {s.value}
                </span>
              </div>
            ))}
            {schoolSubjects.every(s => s.value === null) && <p className="text-gray-400 text-sm">אין נתוני תעודה</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">נוכחות</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {presence !== null ? (
              <>
                <p className={`text-3xl font-bold ${presence < 75 ? 'text-red-600' : presence < 80 ? 'text-orange-500' : 'text-green-600'}`}>
                  {presence}%
                </p>
                <p className="text-sm text-gray-500">נוכחות ({absence}% היעדרות)</p>
              </>
            ) : <p className="text-gray-400 text-sm">נתון לא ידוע</p>}
            {student.mathUnits && <p className="text-sm">מתמטיקה: <strong>{student.mathUnits} יח"ל</strong></p>}
            {student.englishUnits && <p className="text-sm">אנגלית: <strong>{student.englishUnits} יח"ל</strong></p>}
          </CardContent>
        </Card>
      </div>


      {student.notes && (
        <Card>
          <CardHeader><CardTitle className="text-base">הערות</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-gray-600">{student.notes}</p></CardContent>
        </Card>
      )}
    </main>
  )
}

function emptyBagrut(id: string): BagrutScores {
  return {
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
  }
}

function emptySchool(id: string): SchoolGrades {
  return {
    studentId: id,
    civics: null, english: null, history: null, hebrew: null,
    math: null, bible: null, literature: null, pe: null,
  }
}
