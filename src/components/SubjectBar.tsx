'use client'

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

function textColor(v: number): string {
  if (v >= 80) return 'text-green-600'
  if (v >= 65) return 'text-yellow-600'
  if (v >= 45) return 'text-orange-500'
  return 'text-red-600'
}

export function SubjectBar({ label, value, weight }: Props) {
  if (value === null) return null

  return (
    <div className="flex items-center gap-2">
      <span className="w-28 text-sm text-right shrink-0 text-gray-700">{label}</span>
      <div className="flex-1 h-4 bg-gray-100 rounded-sm overflow-hidden">
        <div
          className={`h-full ${barColor(value)} transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`w-10 text-sm font-bold text-left shrink-0 ${textColor(value)}`}>{value}%</span>
      {weight && (
        <span className="w-9 text-xs text-gray-400 shrink-0 text-left">{weight}</span>
      )}
    </div>
  )
}
