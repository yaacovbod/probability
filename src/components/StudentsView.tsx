'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { StudentFullData, RiskLevel } from '@/lib/types'
import { StudentTable } from '@/components/StudentTable'
import { StudentLadder } from '@/components/StudentLadder'
import { ViewToggle } from '@/components/ViewToggle'

type Props = {
  data: StudentFullData[]
}

export function StudentsView({ data }: Props) {
  const [view, setView] = useState<'ladder' | 'table'>('ladder')
  const searchParams = useSearchParams()
  const urlRisk = searchParams.get('risk') as RiskLevel | null

  return (
    <div id="students-view" className="rounded-3xl border border-border/50 bg-card p-6 shadow-clarity animate-fade-up" style={{ animationDelay: '240ms' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="font-black text-foreground text-lg">כל התלמידים</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {view === 'ladder' ? 'סולם אנכי לפי ציון סיכוי · לחיצה פותחת כרטיס' : 'טבלת נתונים ממויינת · לחיצה פותחת כרטיס'}
          </p>
        </div>
        <ViewToggle value={view} onChange={setView} />
      </div>

      {view === 'ladder'
        ? <StudentLadder data={data} urlRiskFilter={urlRisk} />
        : <StudentTable data={data} urlRiskFilter={urlRisk} />
      }
    </div>
  )
}
