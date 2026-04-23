'use client'
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
}

export function DashboardKPI({ data }: Props) {
  const total = data.length
  const veryHigh = data.filter(d => d.result.score >= 85).length
  const high2 = data.filter(d => d.result.score >= 70 && d.result.score < 85).length
  const mid = data.filter(d => d.result.score >= 45 && d.result.score < 70).length
  const low2 = data.filter(d => d.result.score < 45).length

  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0

  const cards: CardSpec[] = [
    { label: 'סך הכל תלמידים', value: total, accent: '#7C3AED', glow: 'rgba(124, 58, 237, 0.12)', icon: '◉', sub: 'שכבה יא׳' },
    { label: 'סיכוי גבוה מאוד', value: veryHigh, accent: '#10B981', glow: 'rgba(16, 185, 129, 0.15)', icon: '▲', sub: `${pct(veryHigh)}% · ציון 85+` },
    { label: 'סיכוי גבוה', value: high2, accent: '#0891B2', glow: 'rgba(8, 145, 178, 0.15)', icon: '◆', sub: `${pct(high2)}% · ציון 70-84` },
    { label: 'סיכוי בינוני', value: mid, accent: '#F59E0B', glow: 'rgba(245, 158, 11, 0.18)', icon: '●', sub: `${pct(mid)}% · ציון 45-69` },
    { label: 'סיכוי נמוך מאוד', value: low2, accent: '#EF4444', glow: 'rgba(239, 68, 68, 0.18)', icon: '▼', sub: `${pct(low2)}% · מתחת 45` },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((c, i) => (
        <div
          key={c.label}
          className="group relative overflow-hidden rounded-3xl bg-card border border-border/50 p-5 shadow-clarity transition-all duration-300 hover:-translate-y-1 hover:shadow-clarity-lg animate-fade-up"
          style={{ animationDelay: `${i * 60}ms` }}
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
          </div>
          <p className="relative text-4xl font-black tracking-tight" style={{ color: c.accent }}>
            {c.value}
          </p>
          <p className="relative mt-1 text-sm font-bold text-foreground">{c.label}</p>
          <p className="relative mt-0.5 text-xs text-muted-foreground">{c.sub}</p>
        </div>
      ))}
    </div>
  )
}
