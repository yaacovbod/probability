import { notFound } from 'next/navigation'
import { getStudentsData } from '@/lib/data'
import { Gauge } from '@/components/Gauge'
import { SubjectBar } from '@/components/SubjectBar'
import { BackButton } from '@/components/BackButton'
import { ClassPosition } from '@/components/ClassPosition'
import { PrintButton } from '@/components/PrintButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RISK_BADGE_CLASSES } from '@/lib/constants'

export const revalidate = 60

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

function ScoreCell({ label, value }: { label: string; value: number | null }) {
  if (value === null) return null
  const color = value < 55 ? 'text-red-600' : value < 65 ? 'text-orange-500' : 'text-gray-800'
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  )
}

export default async function StudentPage({ params }: { params: { id: string } }) {
  const all = await getStudentsData()
  const fullData = all.find(d => d.student.id === params.id)
  if (!fullData) notFound()

  const { student, bagrut, school, result } = fullData
  const allPositions = all.map(d => ({ studentId: d.student.id, score: d.result.score, classGroup: d.student.classGroup }))
  const absence = student.attendanceAbsencePct
  const presence = absence !== null ? Math.round(100 - absence) : null

  const hasEngComponents = [
    bagrut.eng_A, bagrut.eng_B, bagrut.eng_C, bagrut.eng_D,
    bagrut.eng_E, bagrut.eng_F, bagrut.eng_G, bagrut.eng_boost,
  ].some(v => v !== null)

  const engUnits = student.englishUnits
  const engAllComplete =
    engUnits === 3 ? [bagrut.eng_A, bagrut.eng_B, bagrut.eng_C, bagrut.eng_boost].every(v => v !== null) :
    engUnits === 4 ? [bagrut.eng_C, bagrut.eng_D, bagrut.eng_E, bagrut.eng_boost].every(v => v !== null) :
    engUnits === 5 ? [bagrut.eng_E, bagrut.eng_F, bagrut.eng_G, bagrut.eng_boost].every(v => v !== null) :
    false
  const engFinalDisplay = engAllComplete ? bagrut.eng_final : null

  const bagrutSections: { title: string; rows: { label: string; value: number | null }[] }[] = [
    {
      title: 'לשון',
      rows: [
        { label: 'בחינה חיצונית', value: bagrut.lashon_exam },
        { label: 'הערכה פנימית', value: bagrut.lashon_school },
      ],
    },
    {
      title: 'היסטוריה',
      rows: [
        { label: 'משימות מבוקרות', value: bagrut.history_online },
        { label: 'בחינה חיצונית', value: bagrut.history_exam },
        { label: 'הערכה פנימית', value: bagrut.history_school },
      ],
    },
    {
      title: 'תנ"ך',
      rows: [
        { label: 'משימות מבוקרות', value: bagrut.tanach_online },
        { label: 'בחינה חיצונית', value: bagrut.tanach_exam },
        { label: 'הערכה פנימית', value: bagrut.tanach_school },
      ],
    },
    {
      title: 'אזרחות',
      rows: [
        { label: 'משימות מבוקרות', value: bagrut.civics_online },
        { label: 'בחינה חיצונית', value: bagrut.civics_exam },
        { label: 'הערכה פנימית', value: bagrut.civics_school },
      ],
    },
    {
      title: 'ספרות',
      rows: [
        { label: 'משימות מבוקרות', value: bagrut.literature_online },
        { label: 'בחינה חיצונית', value: bagrut.literature_exam },
        { label: 'הערכה פנימית', value: bagrut.literature_school },
      ],
    },
    {
      title: 'אנגלית',
      rows: [
        { label: 'שאלון A', value: bagrut.eng_A },
        { label: 'שאלון B', value: bagrut.eng_B },
        { label: 'שאלון C', value: bagrut.eng_C },
        { label: 'שאלון D', value: bagrut.eng_D },
        { label: 'שאלון E', value: bagrut.eng_E },
        { label: 'שאלון F', value: bagrut.eng_F },
        { label: 'שאלון G', value: bagrut.eng_G },
        { label: 'Boost', value: bagrut.eng_boost },
        { label: 'ציון סופי', value: engFinalDisplay },
      ],
    },
    {
      title: 'מתמטיקה',
      rows: [
        { label: '35173', value: bagrut.math_35173 },
        { label: '35371', value: bagrut.math_35371 },
        { label: '35372', value: bagrut.math_35372 },
        { label: '35471', value: bagrut.math_35471 },
        { label: '35472', value: bagrut.math_35472 },
        { label: '35571', value: bagrut.math_35571 },
        { label: '35572', value: bagrut.math_35572 },
      ],
    },
    {
      title: 'מגמה',
      rows: [
        { label: 'ביולוגיה', value: bagrut.major_bio },
        { label: 'פסיכולוגיה', value: bagrut.major_psychology },
        { label: 'פיזיקה', value: bagrut.major_physics },
        { label: 'מידע ונתונים', value: bagrut.major_data },
        { label: 'אומנות', value: bagrut.major_art },
        { label: 'תקשורת', value: bagrut.major_communication },
        { label: 'כימיה', value: bagrut.major_chemistry },
        { label: 'מדעי המחשב', value: bagrut.major_cs },
        { label: 'ניהול עסקי', value: bagrut.major_business },
        { label: 'מוט"ל', value: bagrut.major_motal },
        { label: 'שפות', value: bagrut.major_languages },
      ],
    },
  ].map(s => ({ ...s, rows: s.rows.filter(r => r.value !== null) }))
   .filter(s => s.rows.length > 0)

  const hasBagrut = bagrutSections.length > 0

  const breakdown = [
    { label: 'ציוני בגרויות שנעשו', value: result.breakdown.bagrutDone, weight: '55%' },
    { label: 'ציוני תעודה', value: result.breakdown.schoolGrades, weight: '15%' },
    { label: 'רמת מתמטיקה + אנגלית', value: result.breakdown.mathEnglishLevel, weight: '10%' },
    { label: 'נוכחות', value: result.breakdown.attendance, weight: '20%' },
  ]

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
    ...(school.majorSubject && school.major !== null
      ? [{ label: `מגמה (${school.majorSubject})`, value: school.major }]
      : []),
  ]

  const renderedAt = new Date().toLocaleString('he-IL', {
    timeZone: 'Asia/Jerusalem',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <main dir="rtl" className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              דשבורד בגרות › {student.classGroup} › {student.fullName}
            </p>
            <h1 className="text-2xl font-bold">
              {student.fullName}
              {student.isSpecialEd && <span className="text-yellow-500 mr-2">★</span>}
            </h1>
            <p className="text-gray-500 text-sm">{student.classGroup} | ת"ז: {student.id}</p>
          </div>
        </div>
        <PrintButton />
      </div>
      {/* Timestamp — visible on screen and in print */}
      <p className="text-xs text-muted-foreground text-left">
        המידע המוצג נכון לתאריך ושעה: {renderedAt}
      </p>
      {/* Print header — visible only in print */}
      <div className="hidden print:block">
        <h1 className="text-xl font-bold">{student.fullName}</h1>
        <p className="text-sm text-gray-500">{student.classGroup} | ת"ז: {student.id} | נעימת הלב — דשבורד בגרות מחזור ג׳</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col items-center py-6 px-5">
          <p className="text-xs text-muted-foreground mb-1 text-center" title="ציון משוקלל: 55% בגרויות + 15% תעודה + 10% יח&quot;ל + 20% נוכחות">
            ציון סיכוי כולל
            <span className="mr-1 opacity-50 cursor-help" title="55% בגרויות · 15% תעודה · 10% יח&quot;ל · 20% נוכחות">ⓘ</span>
          </p>
          <Gauge score={result.score} size={200} />
          <div className="mt-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${RISK_BADGE_CLASSES[result.risk]}`}>
              סיכוי {result.risk}
            </span>
          </div>
          <div className="w-full mt-2">
            <ClassPosition
              studentId={student.id}
              score={result.score}
              classGroup={student.classGroup}
              allData={allPositions}
            />
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


      {hasBagrut && (
        <Card>
          <CardHeader><CardTitle className="text-base">ציוני בגרויות</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {bagrutSections.map(section => (
                <div key={section.title}>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1.5">{section.title}</p>
                  <div className="space-y-1">
                    {section.rows.map(row => (
                      <ScoreCell key={row.label} label={row.label} value={row.value} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {student.notes && (
        <Card>
          <CardHeader><CardTitle className="text-base">הערות</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-gray-600">{student.notes}</p></CardContent>
        </Card>
      )}
    </main>
  )
}
