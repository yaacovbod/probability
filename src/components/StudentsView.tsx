'use client'
import { useState } from 'react'
import { StudentFullData } from '@/lib/types'
import { StudentTable } from '@/components/StudentTable'
import { StudentLadder } from '@/components/StudentLadder'
import { ViewToggle } from '@/components/ViewToggle'

type Props = {
  data: StudentFullData[]
}

export function StudentsView({ data }: Props) {
  const [view, setView] = useState<'ladder' | 'table'>('ladder')

  return (
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
  )
}
