'use client'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { StudentFullData } from '@/lib/types'
import { RISK_HEX_COLORS, RISK_LABEL_ORDER } from '@/lib/constants'

type Props = {
  data: StudentFullData[]
}

export function RiskCharts({ data }: Props) {
  const riskDist = RISK_LABEL_ORDER.map(risk => ({
    name: risk,
    value: data.filter(d => d.result.risk === risk).length,
  })).filter(r => r.value > 0)

  const histogram = Array.from({ length: 10 }, (_, i) => {
    const low = i * 10
    const high = low + 10
    return {
      range: `${low}–${high}`,
      count: data.filter(d => d.result.score >= low && d.result.score < high).length,
    }
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-clarity animate-fade-up" style={{ animationDelay: '120ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-foreground text-lg">התפלגות רמות סיכוי</h2>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">פאי</span>
        </div>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="55%" height={200}>
            <PieChart>
              <Pie data={riskDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} strokeWidth={3} stroke="#fff">
                {riskDist.map(entry => (
                  <Cell key={entry.name} fill={RISK_HEX_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} תלמידים`, '']}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid rgba(8, 145, 178, 0.15)',
                  boxShadow: '0 8px 32px -8px rgba(8, 145, 178, 0.2)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2.5 text-sm flex-1">
            {RISK_LABEL_ORDER.map(risk => {
              const count = data.filter(d => d.result.risk === risk).length
              if (count === 0) return null
              const pct = Math.round((count / data.length) * 100)
              return (
                <div key={risk} className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: RISK_HEX_COLORS[risk] }} />
                  <span className="text-muted-foreground font-medium flex-1">{risk}</span>
                  <span className="font-black text-foreground tabular-nums">{count}</span>
                  <span className="text-xs text-muted-foreground tabular-nums w-8 text-left">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-clarity animate-fade-up" style={{ animationDelay: '180ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-foreground text-lg">התפלגות ציוני סיכוי</h2>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">היסטוגרמה</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={histogram}>
            <XAxis dataKey="range" fontSize={11} tick={{ fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
            <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid rgba(124, 58, 237, 0.15)',
                boxShadow: '0 8px 32px -8px rgba(124, 58, 237, 0.2)',
              }}
              cursor={{ fill: 'rgba(124, 58, 237, 0.06)' }}
            />
            <Bar dataKey="count" name="תלמידים" fill="#7C3AED" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
