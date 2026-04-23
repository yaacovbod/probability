'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StudentFullData, RiskLevel } from '@/lib/types'

type Props = {
  data: StudentFullData[]
}

const RISK_COLORS: Record<RiskLevel, string> = {
  'גבוה מאוד': '#10B981',
  'גבוה': '#0891B2',
  'בינוני': '#F59E0B',
  'נמוך מאוד': '#EF4444',
}

const RISK_RING: Record<RiskLevel, string> = {
  'גבוה מאוד': 'rgba(16, 185, 129, 0.25)',
  'גבוה': 'rgba(8, 145, 178, 0.25)',
  'בינוני': 'rgba(245, 158, 11, 0.25)',
  'נמוך מאוד': 'rgba(239, 68, 68, 0.25)',
}

const ZONES: { label: string; min: number; max: number; bg: string; accent: string }[] = [
  { label: 'סיכוי גבוה מאוד', min: 85, max: 100, bg: 'rgba(16, 185, 129, 0.08)', accent: '#10B981' },
  { label: 'סיכוי גבוה', min: 70, max: 85, bg: 'rgba(8, 145, 178, 0.08)', accent: '#0891B2' },
  { label: 'סיכוי בינוני', min: 45, max: 70, bg: 'rgba(245, 158, 11, 0.08)', accent: '#F59E0B' },
  { label: 'סיכוי נמוך מאוד', min: 0, max: 45, bg: 'rgba(239, 68, 68, 0.08)', accent: '#EF4444' },
]

type Positioned = {
  student: StudentFullData
  cx: number
  cy: number
  classIndex: number
}

function extractClassNumber(classGroup: string): number {
  const match = classGroup.match(/(\d+)\s*$/)
  return match ? parseInt(match[1], 10) : 0
}

const LADDER_HEIGHT = 680
const LADDER_PADDING_TOP = 32
const LADDER_PADDING_BOTTOM = 40
const TRACK_HEIGHT = LADDER_HEIGHT - LADDER_PADDING_TOP - LADDER_PADDING_BOTTOM

function scoreToY(score: number): number {
  const clamped = Math.max(0, Math.min(100, score))
  return LADDER_PADDING_TOP + (100 - clamped) / 100 * TRACK_HEIGHT
}

export function StudentLadder({ data }: Props) {
  const router = useRouter()
  const [hovered, setHovered] = useState<string | null>(null)
  const [classFilter, setClassFilter] = useState<'all' | number>('all')
  const [riskFilter, setRiskFilter] = useState<'all' | RiskLevel>('all')

  const filtered = useMemo(() => {
    return data.filter(d => {
      if (classFilter !== 'all' && extractClassNumber(d.student.classGroup) !== classFilter) return false
      if (riskFilter !== 'all' && d.result.risk !== riskFilter) return false
      return true
    })
  }, [data, classFilter, riskFilter])

  const classNumbers = useMemo(() => {
    const set = new Set<number>()
    data.forEach(d => {
      const n = extractClassNumber(d.student.classGroup)
      if (n > 0) set.add(n)
    })
    return Array.from(set).sort((a, b) => a - b)
  }, [data])

  const riskCounts = useMemo(() => {
    const counts: Record<RiskLevel, number> = {
      'גבוה מאוד': 0, 'גבוה': 0, 'בינוני': 0, 'נמוך מאוד': 0,
    }
    data.forEach(d => { counts[d.result.risk]++ })
    return counts
  }, [data])

  const positioned = useMemo<Positioned[]>(() => {
    const byClass = new Map<number, StudentFullData[]>()
    filtered.forEach(d => {
      const n = extractClassNumber(d.student.classGroup) || 0
      if (!byClass.has(n)) byClass.set(n, [])
      byClass.get(n)!.push(d)
    })

    const allClasses = classNumbers.length > 0 ? classNumbers : [0]
    const laneCount = allClasses.length
    const LANE_PADDING_LEFT = 60
    const LANE_PADDING_RIGHT = 80
    const laneWidth = (1000 - LANE_PADDING_LEFT - LANE_PADDING_RIGHT) / laneCount

    const result: Positioned[] = []

    byClass.forEach((students, classNum) => {
      const classIndex = allClasses.indexOf(classNum)
      if (classIndex === -1) return
      const laneCenter = LANE_PADDING_LEFT + laneWidth * classIndex + laneWidth / 2

      const sorted = [...students].sort((a, b) => a.result.score - b.result.score)
      const placed: { y: number; x: number }[] = []

      sorted.forEach(d => {
        const baseY = scoreToY(d.result.score)
        let cx = laneCenter
        let attempt = 0
        const maxJitter = Math.min(laneWidth * 0.42, 40)
        while (placed.some(p => Math.abs(p.y - baseY) < 14 && Math.abs(p.x - cx) < 16) && attempt < 12) {
          attempt++
          const direction = attempt % 2 === 0 ? 1 : -1
          const magnitude = Math.min(maxJitter, 8 + attempt * 4)
          cx = laneCenter + direction * magnitude
        }
        placed.push({ y: baseY, x: cx })
        result.push({ student: d, cx, cy: baseY, classIndex })
      })
    })

    return result
  }, [filtered, classNumbers])

  const hoveredStudent = hovered ? positioned.find(p => p.student.student.id === hovered) : null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setClassFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
              classFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-clarity'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            כל הכיתות
          </button>
          {classNumbers.map(n => (
            <button
              key={n}
              onClick={() => setClassFilter(n)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
                classFilter === n
                  ? 'bg-primary text-primary-foreground shadow-clarity'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              יא{n}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setRiskFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
              riskFilter === 'all' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            הכל
          </button>
          {(Object.keys(RISK_COLORS) as RiskLevel[]).map(risk => (
            <button
              key={risk}
              onClick={() => setRiskFilter(risk)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
                riskFilter === risk ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: RISK_COLORS[risk] }} />
              {risk}
              <span className="opacity-60">({riskCounts[risk]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative rounded-3xl bg-card border border-border/60 shadow-clarity overflow-hidden">
        <svg
          viewBox={`0 0 1000 ${LADDER_HEIGHT}`}
          className="w-full h-auto"
          style={{ minHeight: 520 }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="ladder-fade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(8, 145, 178, 0.05)" />
              <stop offset="100%" stopColor="rgba(8, 145, 178, 0)" />
            </linearGradient>
          </defs>

          {ZONES.map(zone => {
            const yTop = scoreToY(zone.max)
            const yBottom = scoreToY(zone.min)
            return (
              <g key={zone.label}>
                <rect
                  x={60}
                  y={yTop}
                  width={860}
                  height={yBottom - yTop}
                  fill={zone.bg}
                />
                <line
                  x1={60} x2={920} y1={yBottom} y2={yBottom}
                  stroke="rgba(148, 163, 184, 0.25)"
                  strokeDasharray="4 6"
                />
                <text
                  x={930}
                  y={(yTop + yBottom) / 2}
                  fill={zone.accent}
                  fontSize={11}
                  fontWeight={700}
                  dominantBaseline="middle"
                  textAnchor="start"
                  direction="rtl"
                >
                  {zone.label}
                </text>
              </g>
            )
          })}

          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(v => {
            const y = scoreToY(v)
            const isMajor = v % 20 === 0
            return (
              <g key={v}>
                <text
                  x={48}
                  y={y}
                  fill="var(--muted-foreground)"
                  fontSize={isMajor ? 11 : 9}
                  fontWeight={isMajor ? 700 : 500}
                  textAnchor="end"
                  dominantBaseline="middle"
                  opacity={isMajor ? 0.9 : 0.5}
                >
                  {v}
                </text>
                {isMajor && (
                  <line
                    x1={54} x2={60} y1={y} y2={y}
                    stroke="var(--muted-foreground)"
                    strokeWidth={1}
                    opacity={0.4}
                  />
                )}
              </g>
            )
          })}

          {classNumbers.map((n, i) => {
            const LANE_PADDING_LEFT = 60
            const LANE_PADDING_RIGHT = 80
            const laneWidth = (1000 - LANE_PADDING_LEFT - LANE_PADDING_RIGHT) / classNumbers.length
            const laneCenter = LANE_PADDING_LEFT + laneWidth * i + laneWidth / 2
            return (
              <text
                key={n}
                x={laneCenter}
                y={LADDER_HEIGHT - 12}
                fill="var(--muted-foreground)"
                fontSize={12}
                fontWeight={700}
                textAnchor="middle"
                opacity={0.7}
              >
                יא{n}
              </text>
            )
          })}

          {positioned.map((p, i) => {
            const isHovered = hovered === p.student.student.id
            const color = RISK_COLORS[p.student.result.risk]
            return (
              <g
                key={p.student.student.id}
                className="cursor-pointer"
                style={{
                  animation: `ladder-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) both`,
                  animationDelay: `${Math.min(i * 0.015, 1.2)}s`,
                  transformOrigin: `${p.cx}px ${p.cy}px`,
                }}
                onMouseEnter={() => setHovered(p.student.student.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => router.push(`/student/${p.student.student.id}`)}
              >
                {isHovered && (
                  <circle
                    cx={p.cx}
                    cy={p.cy}
                    r={16}
                    fill={RISK_RING[p.student.result.risk]}
                  />
                )}
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={isHovered ? 10 : 7}
                  fill={color}
                  stroke="white"
                  strokeWidth={2}
                  style={{
                    filter: isHovered
                      ? `drop-shadow(0 4px 10px ${color}80)`
                      : `drop-shadow(0 1px 2px rgba(0,0,0,0.15))`,
                    transition: 'r 0.2s ease, filter 0.2s ease',
                  }}
                />
              </g>
            )
          })}
        </svg>

        {hoveredStudent && (
          <div
            className="pointer-events-none absolute z-10 px-3 py-2 rounded-xl bg-foreground text-background text-xs font-bold shadow-clarity-lg"
            style={{
              right: `${(hoveredStudent.cx / 1000) * 100}%`,
              top: `${(hoveredStudent.cy / LADDER_HEIGHT) * 100}%`,
              transform: 'translate(50%, -130%)',
              whiteSpace: 'nowrap',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: RISK_COLORS[hoveredStudent.student.result.risk] }}
              />
              <span>{hoveredStudent.student.student.fullName}</span>
            </div>
            <div className="text-[10px] opacity-75 font-normal">
              {hoveredStudent.student.student.classGroup} · ציון {hoveredStudent.student.result.score} · {hoveredStudent.student.result.risk}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <p className="font-medium">
          מוצגים <span className="text-foreground font-bold">{positioned.length}</span> מתוך {data.length} תלמידים
        </p>
        <p className="opacity-70">לחץ על נקודה לפתיחת כרטיס תלמיד</p>
      </div>
    </div>
  )
}
