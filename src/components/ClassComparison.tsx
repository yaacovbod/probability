'use client'
import { StudentFullData } from '@/lib/types'

type Props = {
  data: StudentFullData[]
}

function extractClassNum(classGroup: string): number {
  const m = classGroup.match(/(\d+)\s*$/)
  return m ? parseInt(m[1], 10) : 0
}

export function ClassComparison({ data }: Props) {
  const classNums = Array.from(new Set(data.map(d => extractClassNum(d.student.classGroup)))).filter(n => n > 0).sort((a, b) => a - b)
  if (classNums.length < 2) return null

  const globalAvg = Math.round(data.reduce((s, d) => s + d.result.score, 0) / data.length)

  const rows = classNums.map(n => {
    const students = data.filter(d => extractClassNum(d.student.classGroup) === n)
    const avg = Math.round(students.reduce((s, d) => s + d.result.score, 0) / students.length)
    const veryHigh = students.filter(d => d.result.score >= 85).length
    const low = students.filter(d => d.result.score < 45).length
    const pctPass = Math.round(((students.length - low) / students.length) * 100)
    return { n, students: students.length, avg, veryHigh, low, pctPass }
  })

  const maxAvg = Math.max(...rows.map(r => r.avg))
  const minAvg = Math.min(...rows.map(r => r.avg))

  return (
    <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-clarity animate-fade-up" style={{ animationDelay: '150ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-foreground text-lg">השוואה בין כיתות</h2>
        <span className="text-xs text-muted-foreground font-medium">ממוצע שכבה: <span className="font-black text-foreground">{globalAvg}</span></span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {rows.map(row => {
          const isBest = row.avg === maxAvg
          const isWorst = row.avg === minAvg && minAvg !== maxAvg
          const diff = row.avg - globalAvg
          return (
            <div
              key={row.n}
              className={`rounded-2xl border p-4 text-center transition-all ${
                isBest ? 'border-emerald-300/60 bg-emerald-50/50' :
                isWorst ? 'border-red-300/60 bg-red-50/50' :
                'border-border/40 bg-muted/20'
              }`}
            >
              <p className="text-xs font-bold text-muted-foreground mb-1">יא{row.n}</p>
              <p className={`text-3xl font-black tabular-nums ${isBest ? 'text-emerald-600' : isWorst ? 'text-destructive' : 'text-foreground'}`}>
                {row.avg}
              </p>
              <p className={`text-xs font-bold mt-0.5 ${diff >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                {diff >= 0 ? '+' : ''}{diff}
              </p>
              <div className="mt-2 text-[10px] text-muted-foreground space-y-0.5">
                <p>{row.students} תלמידים</p>
                <p className="text-emerald-600 font-semibold">{row.veryHigh} גבוה מאוד</p>
                {row.low > 0 && <p className="text-destructive font-semibold">{row.low} בסיכון נמוך</p>}
              </div>
              {isBest && <p className="mt-1.5 text-[10px] font-bold text-emerald-600">★ חזקה</p>}
              {isWorst && <p className="mt-1.5 text-[10px] font-bold text-destructive">⚑ דורשת תשומת לב</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
