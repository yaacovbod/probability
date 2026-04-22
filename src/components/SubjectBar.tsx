'use client'
import { Progress } from '@/components/ui/progress'

type Props = {
  label: string
  value: number | null
  weight?: string
}

function barColor(v: number): string {
  if (v >= 80) return 'bg-green-500'
  if (v >= 65) return 'bg-yellow-400'
  if (v >= 45) return 'bg-orange-400'
  return 'bg-red-500'
}

export function SubjectBar({ label, value, weight }: Props) {
  if (value === null) return null

  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-sm text-right shrink-0">{label}</span>
      <div className="flex-1 relative">
        <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor(value)} transition-all rounded-full`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
      <span className="w-12 text-sm font-semibold text-left shrink-0">{value}%</span>
      {weight && <span className="text-xs text-gray-400 shrink-0">{weight}</span>}
    </div>
  )
}
