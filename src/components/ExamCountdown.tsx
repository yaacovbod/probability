'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { BagrutScores, StudentFullData, SubjectProbs } from '@/lib/types'
import { EXAM_SCHEDULE, daysUntil } from '@/lib/exam-schedule'

type Props = {
  data: StudentFullData[]
}

type ExamGroup = {
  subject: keyof SubjectProbs
  bagrutField?: keyof BagrutScores
  label: string
  round: 'א' | 'ב'
  firstDate: Date
  titles: string[]
  atRisk: StudentFullData[]
  passing: number
  total: number
  daysLeft: number
}

export function ExamCountdown({ data }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const groups = useMemo<ExamGroup[]>(() => {
    // Find the earliest מועד א date per subject (to gate מועד ב visibility)
    const moadADate = new Map<keyof SubjectProbs, Date>()
    for (const exam of EXAM_SCHEDULE) {
      if (exam.round !== 'א') continue
      const cur = moadADate.get(exam.subject)
      if (!cur || exam.date < cur) moadADate.set(exam.subject, exam.date)
    }

    const map = new Map<string, ExamGroup>()

    for (const exam of EXAM_SCHEDULE) {
      const d = daysUntil(exam.date)
      if (d < 0) continue // past

      // מועד ב — only show after מועד א has passed
      if (exam.round === 'ב') {
        const aDate = moadADate.get(exam.subject)
        if (aDate && daysUntil(aDate) >= 0) continue
      }

      // Major exams: each title gets its own card; others: group by subject
      const key = exam.bagrutField ? `${exam.title}-${exam.round}` : `${exam.subject}-${exam.round}`
      if (!map.has(key)) {
        const withData = exam.schoolMajorKey
          ? data.filter(s => {
              // For exams with a unique bagrut field (not the shared major_other bucket),
              // bagrut score takes priority; fall back to school grade if absent.
              const hasDedicatedBagrut =
                exam.bagrutField && exam.bagrutField !== 'major_other'
                  ? s.bagrut[exam.bagrutField] !== null
                  : false
              return (
                hasDedicatedBagrut ||
                s.student.majorName === exam.schoolMajorKey ||
                (!s.student.majorName && s.school.majorSubject === exam.schoolMajorKey)
              )
            })
          : exam.bagrutField
            ? data.filter(s => s.bagrut[exam.bagrutField!] !== null)
            : data.filter(s => s.result.subjectProbs[exam.subject] !== null)
        const atRisk = withData
          .filter(s => (s.result.subjectProbs[exam.subject] ?? 0) < 60)
          .sort((a, b) => (a.result.subjectProbs[exam.subject] ?? 0) - (b.result.subjectProbs[exam.subject] ?? 0))
        const passing = withData.filter(s => (s.result.subjectProbs[exam.subject] ?? 0) >= 60).length
        map.set(key, {
          subject: exam.subject,
          bagrutField: exam.bagrutField,
          label: exam.label,
          round: exam.round,
          firstDate: exam.date,
          titles: [exam.title],
          atRisk,
          passing,
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
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">לו&quot;ז</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {groups.map(g => {
          const key = `${g.subject}-${g.round}`
          const isOpen = expanded === key
          const isUrgent = g.daysLeft <= 14
          const isVeryUrgent = g.daysLeft <= 7
          const pctAtRisk = g.total > 0 ? Math.round((g.atRisk.length / g.total) * 100) : 0

          return (
            <div
              key={key}
              className={`rounded-2xl border transition-all ${
                isVeryUrgent ? 'border-red-300/70 bg-red-50/50' :
                isUrgent     ? 'border-amber-300/60 bg-amber-50/30' :
                isOpen       ? 'border-primary/40 bg-primary/5' :
                               'border-border/40 bg-muted/20'
              }`}
            >
              {/* Card header — always visible, clickable */}
              <button
                className="w-full text-right p-4 cursor-pointer"
                onClick={() => setExpanded(isOpen ? null : key)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-black ${isVeryUrgent ? 'text-destructive' : isUrgent ? 'text-amber-700' : 'text-foreground'}`}>
                      {g.label}
                      {g.round === 'ב' && <span className="text-[10px] font-bold mr-1.5 opacity-70">מועד ב</span>}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {g.firstDate.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })}
                      {g.titles.length > 1 && <span className="mr-1 opacity-60">· {g.titles.length} מסלולים</span>}
                    </p>
                  </div>
                  <div className={`shrink-0 text-center rounded-xl px-2.5 py-1 ${
                    isVeryUrgent ? 'bg-red-100 text-destructive' :
                    isUrgent     ? 'bg-amber-100 text-amber-700' :
                                   'bg-muted text-muted-foreground'
                  }`}>
                    <p className="text-xl font-black tabular-nums leading-none">{g.daysLeft}</p>
                    <p className="text-[9px] font-bold">ימים</p>
                  </div>
                </div>

                {g.total > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {g.atRisk.length} בסיכון · {g.passing} עוברים
                        {g.atRisk.length > 0 && (
                          <span className="mr-1 opacity-60">{isOpen ? '▲' : '▼'} לחץ לפרטים</span>
                        )}
                      </span>
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
              </button>

              {/* Expanded student list */}
              {isOpen && g.atRisk.length > 0 && (
                <div className="border-t border-border/40 px-4 pb-3 pt-2 space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    תלמידים בסיכון — {g.label}
                  </p>
                  {g.atRisk.map(s => {
                    const prob = s.result.subjectProbs[g.subject] ?? 0
                    return (
                      <Link
                        key={s.student.id}
                        href={`/student/${s.student.id}`}
                        className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-background/80 transition-colors group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-semibold truncate">{s.student.fullName}</span>
                          {s.student.isSpecialEd && <span className="text-amber-500 text-[10px]">★</span>}
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            יא{s.student.classGroup.replace(/.*?(\d+)$/, '$1')}
                          </span>
                        </div>
                        <span className={`text-xs font-black tabular-nums shrink-0 ${
                          prob < 30 ? 'text-destructive' : prob < 50 ? 'text-amber-600' : 'text-muted-foreground'
                        }`}>
                          {prob}%
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}

              {isOpen && g.atRisk.length === 0 && (
                <div className="border-t border-border/40 px-4 py-3 text-center">
                  <p className="text-xs text-emerald-600 font-bold">כל התלמידים בסיכוי עובר ✓</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
