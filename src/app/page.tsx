'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { StudentFullData } from '@/lib/types'
import { DashboardKPI } from '@/components/DashboardKPI'
import { StudentTable } from '@/components/StudentTable'
import { Button } from '@/components/ui/button'

const RISK_COLORS: Record<string, string> = {
  'גבוה מאוד': '#15803d',
  'גבוה': '#22c55e',
  'בינוני': '#eab308',
  'נמוך מאוד': '#ef4444',
}

export default function DashboardPage() {
  const [data, setData] = useState<StudentFullData[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p className="text-gray-500 text-lg">טוען נתונים...</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-700">אין נתונים</h1>
        <p className="text-gray-500">יש להעלות קובץ Excel כדי להתחיל</p>
        <Link href="/upload">
          <Button>העלאת Excel</Button>
        </Link>
      </div>
    )
  }

  return (
    <main dir="rtl" className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">דשבורד בגרות — שכבת יא׳</h1>
          <p className="text-gray-500 mt-1">נעימת הלב, חריש</p>
        </div>
        <Link href="/upload"><Button variant="outline">עדכון Excel</Button></Link>
      </div>

      <DashboardKPI data={data} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold mb-4 text-gray-700">התפלגות רמות סיכוי</h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie data={riskDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                  {riskDist.map(entry => (
                    <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} תלמידים`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 text-sm">
              {['גבוה מאוד', 'גבוה', 'בינוני', 'נמוך מאוד'].map(risk => {
                const count = data.filter(d => d.result.risk === risk).length
                if (count === 0) return null
                return (
                  <div key={risk} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: RISK_COLORS[risk] }} />
                    <span className="text-gray-600">{risk}</span>
                    <span className="font-bold text-gray-800 mr-1">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold mb-4 text-gray-700">התפלגות ציוני סיכוי</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={histogram}>
              <XAxis dataKey="range" fontSize={11} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" name="תלמידים" fill="#0891B2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold mb-4 text-gray-700">כל התלמידים</h2>
        <StudentTable data={data} />
      </div>
    </main>
  )
}
