'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { StudentFullData } from '@/lib/types'
import { DashboardKPI } from '@/components/DashboardKPI'
import { StudentTable } from '@/components/StudentTable'
import { StudentLadder } from '@/components/StudentLadder'
import { ViewToggle } from '@/components/ViewToggle'
import { Button } from '@/components/ui/button'

const RISK_COLORS: Record<string, string> = {
  'גבוה מאוד': '#10B981',
  'גבוה': '#0891B2',
  'בינוני': '#F59E0B',
  'נמוך מאוד': '#EF4444',
}

export default function DashboardPage() {
  const [data, setData] = useState<StudentFullData[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'ladder' | 'table'>('ladder')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/data')
      if (!res.ok) throw new Error('שגיאה בטעינת נתונים')
      const computed: StudentFullData[] = await res.json()
      setData(computed)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const riskDist = ['גבוה מאוד', 'גבוה', 'בינוני', 'נמוך מאוד'].map(risk => ({
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

  const avgScore = data.length
    ? Math.round(data.reduce((sum, d) => sum + d.result.score, 0) / data.length)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">טוען נתונים...</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4" dir="rtl">
        <div className="rounded-3xl bg-card border border-border/50 shadow-clarity p-10 text-center max-w-md">
          <h1 className="text-2xl font-black text-foreground mb-2">אין נתונים להצגה</h1>
          <p className="text-muted-foreground mb-6">יש להעלות קובץ Excel כדי להתחיל לעקוב אחרי סיכויי הבגרות</p>
          <Link href="/upload">
            <Button className="rounded-full shadow-clarity">העלאת Excel</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main dir="rtl" className="max-w-7xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 animate-fade-up">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            נעימת הלב · חריש
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
            דשבורד בגרות
            <span className="block text-primary">מחזור ג׳</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base font-medium">
            מעקב אחרי סיכויי הצלחה של {data.length} תלמידים
          </p>
        </div>
        <Link href="/upload">
          <Button variant="outline" className="rounded-full border-border/60 hover:bg-accent hover:border-primary/30">
            עדכון Excel
          </Button>
        </Link>
      </header>

      <DashboardKPI data={data} />

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
                    <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
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
              {['גבוה מאוד', 'גבוה', 'בינוני', 'נמוך מאוד'].map(risk => {
                const count = data.filter(d => d.result.risk === risk).length
                if (count === 0) return null
                const pct = Math.round((count / data.length) * 100)
                return (
                  <div key={risk} className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: RISK_COLORS[risk] }} />
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
                  border: '1px solid rgba(8, 145, 178, 0.15)',
                  boxShadow: '0 8px 32px -8px rgba(8, 145, 178, 0.2)',
                }}
                cursor={{ fill: 'rgba(8, 145, 178, 0.08)' }}
              />
              <Bar dataKey="count" name="תלמידים" fill="#0891B2" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-clarity animate-fade-up" style={{ animationDelay: '240ms' }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="font-black text-foreground text-lg">כל התלמידים</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {view === 'ladder' ? 'סולם אנכי לפי ציון סיכוי · לחיצה פותחת כרטיס' : 'טבלת נתונים ממויינת · לחיצה פותחת כרטיס'}
            </p>
          </div>
          <ViewToggle value={view} onChange={setView} />
        </div>

        {view === 'ladder' ? <StudentLadder data={data} /> : <StudentTable data={data} />}
      </div>
    </main>
  )
}
