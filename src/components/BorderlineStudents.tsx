'use client'
import Link from 'next/link'
import { StudentFullData } from '@/lib/types'

type Props = {
  data: StudentFullData[]
}

function StudentRow({ d }: { d: StudentFullData }) {
  return (
    <Link
      href={`/student/${d.student.id}`}
      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-accent/50 transition-colors group"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-semibold text-foreground truncate">{d.student.fullName}</span>
        {d.student.isSpecialEd && <span className="text-amber-500 text-xs">★</span>}
        <span className="text-xs text-muted-foreground shrink-0">
          יא{d.student.classGroup.replace(/.*?(\d+)$/, '$1')}
        </span>
      </div>
      <span className="text-base font-black tabular-nums shrink-0 mr-2" style={{ color: '#F59E0B' }}>
        {d.result.score}
      </span>
    </Link>
  )
}

export function BorderlineStudents({ data }: Props) {
  const nearFail = data
    .filter(d => d.result.score >= 40 && d.result.score <= 55)
    .sort((a, b) => b.result.score - a.result.score)

  const nearRise = data
    .filter(d => d.result.score >= 60 && d.result.score <= 75)
    .sort((a, b) => b.result.score - a.result.score)

  if (nearFail.length === 0 && nearRise.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: '60ms' }}>
      {nearFail.length > 0 && (
        <div className="rounded-3xl border border-red-200/60 bg-card p-5 shadow-clarity">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-red-50 text-red-500 font-black text-sm">▼</span>
            <div>
              <h2 className="font-black text-foreground text-sm">בגבול הכישלון</h2>
              <p className="text-xs text-muted-foreground">ציון 40–55 · {nearFail.length} תלמידים</p>
            </div>
            <span className="mr-auto text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
              התערבות מיידית
            </span>
          </div>
          <div className="space-y-0.5 max-h-52 overflow-y-auto">
            {nearFail.map(d => <StudentRow key={d.student.id} d={d} />)}
          </div>
        </div>
      )}

      {nearRise.length > 0 && (
        <div className="rounded-3xl border border-cyan-200/60 bg-card p-5 shadow-clarity">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-cyan-50 text-primary font-black text-sm">▲</span>
            <div>
              <h2 className="font-black text-foreground text-sm">בגבול העלייה</h2>
              <p className="text-xs text-muted-foreground">ציון 60–75 · {nearRise.length} תלמידים</p>
            </div>
            <span className="mr-auto text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              דחיפה קטנה תשנה
            </span>
          </div>
          <div className="space-y-0.5 max-h-52 overflow-y-auto">
            {nearRise.map(d => <StudentRow key={d.student.id} d={d} />)}
          </div>
        </div>
      )}
    </div>
  )
}
