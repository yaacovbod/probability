'use client'
import { Card, CardContent } from '@/components/ui/card'
import { StudentFullData } from '@/lib/types'

type Props = {
  data: StudentFullData[]
}

export function DashboardKPI({ data }: Props) {
  const total = data.length

  const veryHigh = data.filter(d => d.result.score >= 85).length
  const high2 = data.filter(d => d.result.score >= 70 && d.result.score < 85).length
  const mid = data.filter(d => d.result.score >= 45 && d.result.score < 70).length
  const low2 = data.filter(d => d.result.score < 45).length

  const cards = [
    { label: 'סה"כ תלמידים', value: total, color: 'text-gray-800', bg: 'bg-gray-50' },
    { label: 'סיכוי גבוה מאוד (85+)', value: veryHigh, color: 'text-green-800', bg: 'bg-green-100' },
    { label: 'סיכוי גבוה (70–84)', value: high2, color: 'text-green-700', bg: 'bg-green-50' },
    { label: 'סיכוי בינוני (45–69)', value: mid, color: 'text-yellow-700', bg: 'bg-yellow-50' },
    { label: 'סיכוי נמוך מאוד (מתחת 45)', value: low2, color: 'text-red-700', bg: 'bg-red-50' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(c => (
        <Card key={c.label} className={c.bg}>
          <CardContent className="pt-4 text-center">
            <p className={`text-4xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-sm text-gray-600 mt-1">{c.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
