'use client'
import { useMemo } from 'react'
import { StudentFullData, SubjectProbs } from '@/lib/types'
import { EXAM_SCHEDULE, daysUntil } from '@/lib/exam-schedule'

type Props = {
  data: StudentFullData[]
}

type ExamGroup = {
  subject: keyof SubjectProbs
  label: string
  round: 'א' | 'ב'
  firstDate: Date
  titles: string[]
  atRisk: number
  total: number
  daysLeft: number
}

export function ExamCountdown({ data }: Props) {
  const groups = useMemo<ExamGroup[]>(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Group by subject+round, keep only upcoming
    const map = new Map<string, ExamGroup>()

    for (const exam of EXAM_SCHEDULE) {
      const d = daysUntil(exam.date)
      if (d < 0) continue // past

      const key = `${exam.subject}-${exam.round}`
      if (!map.has(key)) {
        const withData = data.filter(s => s.result.subjectProbs[exam.subject] !== null)
        const atRisk = withData.filter(s => (s.result.subjectProbs[exam.subject] ?? 0) < 60).length
        map.set(key, {
          subject: exam.subject,
          label: exam.label,
          round: exam.round,
          firstDate: exam.date,
          titles: [exam.title],
          atRisk,
          total: withData.length,
          daysLeft: d,
        })
      } else {
        const g = map.get(key)!
        if (!g.titles.includes(exam.title)) g.titles.push(exam.title)
        if (exam.date < g.firstDate) { g.firstDate = exam.date; g.daysLeft = d }
      }
    }

    return Array.from(map.values()).sort((a, b) => a.daysLeft - b.daysLeft)
  }, [data])

  if (groups.length === 0) return null

  const urgentCount = groups.filter(g => g.daysLeft <= 14).length

  return (
    <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-clarity animate-fade-up" style={{ animationDelay: '105ms' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-black text-foreground text-lg">בגרויות קרובות</h2>
          {urgentCount > 0 && (
            <span className="text-xs font-bold text-white bg-destructive px-2 py-0.5 rounded-full">
              {urgentCount} דחוף
            </span>
          )}
        </div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">לו"ז</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {groups.map(g => {
          const isUrgent = g.daysLeft <= 14
          const isVeryUrgent = g.daysLeft <= 7
          const pctAtRisk = g.total > 0 ? Math.round((g.atRisk / g.total) * 100) : 0

          return (
            <div
              key={`${g.subject}-${g.round}`}
              className={`rounded-2xl border p-4 transition-all ${
                isVeryUrgent ? 'border-red-300/70 bg-red-50/50' :
                isUrgent ? 'border-amber-300/60 bg-amber-50/30' :
                'border-border/40 bg-muted/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className={`text-sm font-black ${isVeryUrgent ? 'text-destructive' : isUrgent ? 'text-amber-700' : 'text-foreground'}`}>
                    {g.label}
                    {g.round === 'ב' && <span className="text-[10px] font-bold mr-1 opacity-70">מועד ב</span>}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {g.firstDate.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <div className={`shrink-0 text-center rounded-xl px-2.5 py-1 ${
                  isVeryUrgent ? 'bg-red-100 text-destructive' :
                  isUrgent ? 'bg-amber-100 text-amber-700' :
                  'bg-muted text-muted-foreground'
                }`}>
                  <p className="text-xl font-black tabular-nums leading-none">{g.daysLeft}</p>
                  <p className="text-[9px] font-bold">ימים</p>
                </div>
              </div>

              {g.total > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{g.atRisk} מתוך {g.total} בסיכון</span>
                    <span className={`font-bold ${pctAtRisk >= 40 ? 'text-destructive' : pctAtRisk >= 20 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {pctAtRisk}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pctAtRisk >= 40 ? 'bg-destructive' : pctAtRisk >= 20 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pctAtRisk}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
