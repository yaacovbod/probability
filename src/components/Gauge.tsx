'use client'

type GaugeProps = {
  score: number
  size?: number
}

function scoreColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 65) return '#eab308'
  if (score >= 45) return '#f97316'
  return '#ef4444'
}

export function Gauge({ score, size = 200 }: GaugeProps) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38
  const strokeWidth = size * 0.12

  const totalAngle = 180
  const angle = (score / 100) * totalAngle

  const toRad = (deg: number) => (deg * Math.PI) / 180

  function polarToXY(deg: number) {
    const rad = toRad(180 - deg)
    return {
      x: cx + r * Math.cos(rad),
      y: cy - r * Math.sin(rad),
    }
  }

  const start = polarToXY(0)
  const end = polarToXY(angle)
  const largeArc = angle > 90 ? 1 : 0

  const color = scoreColor(score)

  return (
    <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
      <path
        d={`M ${polarToXY(0).x} ${polarToXY(0).y} A ${r} ${r} 0 1 1 ${polarToXY(180).x} ${polarToXY(180).y}`}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {score > 0 && (
        <path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      )}
      <text
        x={cx}
        y={cy * 0.95}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size * 0.22}
        fontWeight="bold"
        fill={color}
        fontFamily="Heebo, sans-serif"
      >
        {score}
      </text>
      <text
        x={cx}
        y={cy * 0.95 + size * 0.13}
        textAnchor="middle"
        fontSize={size * 0.08}
        fill="#6b7280"
        fontFamily="Heebo, sans-serif"
      >
        מתוך 100
      </text>
    </svg>
  )
}
