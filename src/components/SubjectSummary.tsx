'use client'
import { StudentFullData, SubjectProbs } from '@/lib/types'

type Props = {
  data: StudentFullData[]
}

const SUBJECTS: { key: keyof SubjectProbs; label: string }[] = [
  { key: 'lashon', label: 'לשון' },
  { key: 'tanach', label: 'תנ"ך' },
  { key: 'history', label: 'היסטוריה' },
  { key: 'civics', label: 'אזרחות' },
  { key: 'literature', label: 'ספרות' },
  { key: 'english', label: 'אנגלית' },
  { key: 'math', label: 'מתמטיקה' },
  { key: 'major', label: 'מגמה' },
]

type SubjectRow = { key: keyof SubjectProbs; label: string; passing: number; atRisk: number; total: number; avg: number; pct: number }

export function SubjectSummary({ data }: Props) {
  const rows: SubjectRow[] = SUBJECTS.flatMap(({ key, label }) => {
    const withData = data.filter(d => d.result.subjectProbs[key] !== null)
    if (withData.length === 0) return []
    const passing = withData.filter(d => (d.result.subjectProbs[key] ?? 0) >= 60).length
    const atRisk = withData.length - passing
    const avg = Math.round(withData.reduce((sum, d) => sum + (d.result.subjectProbs[key] ?? 0), 0) / withData.length)
    const pct = Math.round((passing / withData.length) * 100)
    return [{ key, label, passing, atRisk, total: withData.length, avg, pct }]
  })

  if (rows.length === 0) return null

  const weakest = rows.reduce((a, b) => (a.pct < b.pct ? a : b))

  return (
    <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-clarity animate-fade-up" style={{ animationDelay: '90ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-foreground text-lg">סיכוי לפי מקצוע</h2>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">שכבתי</span>
      </div>

      <div className="space-y-3">
        {rows.sort((a, b) => a.pct - b.pct).map(row => {
          const isWeakest = row.key === weakest.key
          return (
            <div key={row.key} className="flex items-center gap-3">
              <span className={`w-16 text-sm font-bold shrink-0 text-right ${isWeakest ? 'text-destructive' : 'text-foreground'}`}>
                {row.label}
                {isWeakest && <span className="text-[10px] mr-1">⚑</span>}
              </span>
              <div className="flex-1 h-5 bg-muted/60 rounded-full overflow-hidden relative">
                {/* passing segment */}
                <div
                  className="h-full bg-emerald-500/80 rounded-full transition-all"
                  style={{ width: `${row.pct}%` }}
                />
              </div>
              <div className="flex items-center gap-2 shrink-0 w-36 text-xs">
                <span className="font-bold text-emerald-600 tabular-nums w-10 text-left">{row.passing} עוברים</span>
                <span className="text-muted-foreground">·</span>
                <span className={`font-bold tabular-nums w-10 text-left ${row.atRisk > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {row.atRisk} בסיכון
                </span>
              </div>
              <span className={`w-10 text-sm font-black tabular-nums text-left shrink-0 ${row.pct >= 80 ? 'text-emerald-600' : row.pct >= 60 ? 'text-primary' : row.pct >= 40 ? 'text-amber-500' : 'text-destructive'}`}>
                {row.pct}%
              </span>
            </div>
          )
        })}
      </div>

      <p className="mt-4 text-xs text-muted-foreground border-t border-border/40 pt-3">
        <span className="inline-flex items-center gap-1">
          <span className="text-destructive font-bold">⚑</span>
          המקצוע החלש ביותר: <span className="font-bold text-foreground">{weakest.label}</span> — {weakest.pct}% עוברים ({weakest.atRisk} תלמידים בסיכון)
        </span>
      </p>
    </div>
  )
}
