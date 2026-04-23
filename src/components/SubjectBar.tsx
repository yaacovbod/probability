'use client'
import { scoreBarColor, scoreTextColor } from '@/lib/styling'

type Props = {
  label: string
  value: number | null
  weight?: string
}

export function SubjectBar({ label, value, weight }: Props) {
  if (value === null) return null

  return (
    <div className="flex items-center gap-2">
      <span className="w-28 text-sm text-right shrink-0 text-gray-700">{label}</span>
      <div className="flex-1 h-4 bg-gray-100 rounded-sm overflow-hidden">
        <div
          className={`h-full ${scoreBarColor(value)} transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`w-10 text-sm font-bold text-left shrink-0 ${scoreTextColor(value)}`}>{value}%</span>
      {weight && (
        <span className="w-9 text-xs text-gray-400 shrink-0 text-left">{weight}</span>
      )}
    </div>
  )
}
