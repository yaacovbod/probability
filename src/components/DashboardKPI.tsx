'use client'
import { Card, CardContent } from '@/components/ui/card'
import { StudentFullData } from '@/lib/types'

type Props = {
  data: StudentFullData[]
}

export function DashboardKPI({ data }: Props) {
  const total = data.length
  const low = data.filter(d => d.result.score >= 80).length
  const medium = data.filter(d => d.result.score >= 65 && d.result.score < 80).length
  const high = data.filter(d => d.result.score < 65).length

  const cards = [
    { label: 'סה"כ תלמידים', value: total, color: 'text-gray-800', bg: 'bg-gray-50' },
    { label: 'סיכון נמוך (80+)', value: low, color: 'text-green-700', bg: 'bg-green-50' },
    { label: 'סיכון בינוני (65–79)', value: medium, color: 'text-yellow-700', bg: 'bg-yellow-50' },
    { label: 'סיכון גבוה (מתחת 65)', value: high, color: 'text-red-700', bg: 'bg-red-50' },
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
