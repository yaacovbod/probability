'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { StudentFullData } from '@/lib/types'

type Props = {
  data: StudentFullData[]
}

type CardSpec = {
  label: string
  value: number
  accent: string
  glow: string
  icon: string
  sub: string
  riskParam: string | null
}

export function DashboardKPI({ data }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const total = data.length
  const veryHigh = data.filter(d => d.result.score >= 85).length
  const high2 = data.filter(d => d.result.score >= 70 && d.result.score < 85).length
  const mid = data.filter(d => d.result.score >= 45 && d.result.score < 70).length
  const low2 = data.filter(d => d.result.score < 45).length

  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0

  const cards: CardSpec[] = [
    { label: 'סך הכל תלמידים', value: total, accent: '#7C3AED', glow: 'rgba(124, 58, 237, 0.12)', icon: '◉', sub: 'שכבה יא׳', riskParam: null },
    { label: 'סיכוי גבוה מאוד', value: veryHigh, accent: '#10B981', glow: 'rgba(16, 185, 129, 0.15)', icon: '▲', sub: `${pct(veryHigh)}% · ציון 85+`, riskParam: 'גבוה מאוד' },
    { label: 'סיכוי גבוה', value: high2, accent: '#0891B2', glow: 'rgba(8, 145, 178, 0.15)', icon: '◆', sub: `${pct(high2)}% · ציון 70-84`, riskParam: 'גבוה' },
    { label: 'סיכוי בינוני', value: mid, accent: '#F59E0B', glow: 'rgba(245, 158, 11, 0.18)', icon: '●', sub: `${pct(mid)}% · ציון 45-69`, riskParam: 'בינוני' },
    { label: 'סיכוי נמוך מאוד', value: low2, accent: '#EF4444', glow: 'rgba(239, 68, 68, 0.18)', icon: '▼', sub: `${pct(low2)}% · מתחת 45`, riskParam: 'נמוך מאוד' },
  ]

  const activeRisk = searchParams.get('risk')

  function handleClick(riskParam: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (riskParam === null || activeRisk === riskParam) {
      params.delete('risk')
    } else {
      params.set('risk', riskParam)
    }
    const target = document.getElementById('students-view')
    router.push(`?${params.toString()}`, { scroll: false })
    setTimeout(() => target?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((c, i) => {
        const isActive = c.riskParam !== null && activeRisk === c.riskParam
        return (
          <button
            key={c.label}
            onClick={() => handleClick(c.riskParam)}
            className={`group relative overflow-hidden rounded-3xl bg-card border p-5 shadow-clarity transition-all duration-300 hover:-translate-y-1 hover:shadow-clarity-lg animate-fade-up text-right w-full ${
              isActive ? 'border-2 ring-2' : 'border-border/50'
            }`}
            style={{
              animationDelay: `${i * 60}ms`,
              borderColor: isActive ? c.accent : undefined,
            }}
            title={c.riskParam ? `לחץ לסינון לפי ${c.label}` : undefined}
          >
            <div
              className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-60 transition-opacity group-hover:opacity-90"
              style={{ background: c.glow }}
            />
            <div className="relative flex items-start justify-between mb-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-2xl text-lg font-black"
                style={{ background: c.glow, color: c.accent }}
              >
                {c.icon}
              </span>
              {isActive && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: c.glow, color: c.accent }}>
                  מסונן
                </span>
              )}
            </div>
            <p className="relative text-4xl font-black tracking-tight" style={{ color: c.accent }}>
              {c.value}
            </p>
            <p className="relative mt-1 text-sm font-bold text-foreground">{c.label}</p>
            <p className="relative mt-0.5 text-xs text-muted-foreground">{c.sub}</p>
            {c.riskParam && (
              <p className="relative mt-1.5 text-[10px] text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity">
                לחץ לסינון ↓
              </p>
            )}
          </button>
        )
      })}
    </div>
  )
}
