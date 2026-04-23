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
  { label: 'סיכוי גבוה',      min: 70, max: 85,  bg: 'rgba(8, 145, 178, 0.08)',  accent: '#0891B2' },
  { label: 'סיכוי בינוני',    min: 45, max: 70,  bg: 'rgba(245, 158, 11, 0.08)', accent: '#F59E0B' },
  { label: 'סיכוי נמוך מאוד', min: 0,  max: 45,  bg: 'rgba(239, 68, 68, 0.08)',  accent: '#EF4444' },
]

type Positioned = {
  student: StudentFullData
  cx: number
  cy: number
}

function extractClassNumber(classGroup: string): number {
  const match = classGroup.match(/(\d+)\s*$/)
  return match ? parseInt(match[1], 10) : 0
}

// Layout constants
const SVG_WIDTH      = 1000
const LEFT_PAD       = 60   // space for Y-axis labels
const RIGHT_PAD      = 160  // space for zone labels on the right
const DOT_AREA_LEFT  = LEFT_PAD
const DOT_AREA_RIGHT = SVG_WIDTH - RIGHT_PAD  // = 840

const LADDER_HEIGHT     = 680
const PADDING_TOP       = 32
const PADDING_BOTTOM    = 40
const TRACK_HEIGHT      = LADDER_HEIGHT - PADDING_TOP - PADDING_BOTTOM

const NAME_AREA         = 60   // extra SVG height below ladder for names in single-class mode

function scoreToY(score: number): number {
  const clamped = Math.max(0, Math.min(100, score))
  return PADDING_TOP + (100 - clamped) / 100 * TRACK_HEIGHT
}

function hebrewFirstName(fullName: string): string {
  // keep first two words (first + last) for readability
  const parts = fullName.trim().split(/\s+/)
  return parts.slice(0, 2).join(' ')
}

export function StudentLadder({ data }: Props) {
  const router  = useRouter()
  const [hovered,     setHovered]     = useState<string | null>(null)
  const [classFilter, setClassFilter] = useState<'all' | number>('all')
  const [riskFilter,  setRiskFilter]  = useState<'all' | RiskLevel>('all')

  const isSingleClass = classFilter !== 'all'
  const svgHeight     = LADDER_HEIGHT

  const filtered = useMemo(() => data.filter(d => {
    if (classFilter !== 'all' && extractClassNumber(d.student.classGroup) !== classFilter) return false
    if (riskFilter  !== 'all' && d.result.risk !== riskFilter) return false
    return true
  }), [data, classFilter, riskFilter])

  const classNumbers = useMemo(() => {
    const set = new Set<number>()
    data.forEach(d => { const n = extractClassNumber(d.student.classGroup); if (n > 0) set.add(n) })
    return Array.from(set).sort((a, b) => a - b)
  }, [data])

  const riskCounts = useMemo(() => {
    const counts: Record<RiskLevel, number> = { 'גבוה מאוד': 0, 'גבוה': 0, 'בינוני': 0, 'נמוך מאוד': 0 }
    data.forEach(d => { counts[d.result.risk]++ })
    return counts
  }, [data])

  const positioned = useMemo<Positioned[]>(() => {
    const USABLE = DOT_AREA_RIGHT - DOT_AREA_LEFT  // 780px

    // ── Single class: spread alphabetically across full width ──
    if (isSingleClass) {
      const sorted = [...filtered].sort((a, b) =>
        a.student.fullName.localeCompare(b.student.fullName, 'he')
      )
      const count = sorted.length
      // add inner padding so dots don't touch y-axis labels (left) or zone labels (right)
      const DOT_L = DOT_AREA_LEFT + 15
      const DOT_R = DOT_AREA_RIGHT - 25
      const DOT_W = DOT_R - DOT_L
      return sorted.map((d, i) => ({
        student: d,
        cx: count <= 1
          ? DOT_L + DOT_W / 2
          : DOT_L + (DOT_W / (count - 1)) * i,
        cy: scoreToY(d.result.score),
      }))
    }

    // ── Multi class: one lane per class with collision avoidance ──
    const byClass = new Map<number, StudentFullData[]>()
    filtered.forEach(d => {
      const n = extractClassNumber(d.student.classGroup) || 0
      if (!byClass.has(n)) byClass.set(n, [])
      byClass.get(n)!.push(d)
    })

    const allClasses  = classNumbers.length > 0 ? classNumbers : [0]
    const laneWidth   = USABLE / allClasses.length
    const result: Positioned[] = []

    byClass.forEach((students, classNum) => {
      const ci = allClasses.indexOf(classNum)
      if (ci === -1) return
      const center  = DOT_AREA_LEFT + laneWidth * ci + laneWidth / 2
      const maxJitter = Math.min(laneWidth * 0.42, 40)
      const placed: { y: number; x: number }[] = []

      const sorted = [...students].sort((a, b) => a.result.score - b.result.score)
      sorted.forEach(d => {
          const baseY = scoreToY(d.result.score)
          let cx = center, attempt = 0
          while (placed.some(p => Math.abs(p.y - baseY) < 14 && Math.abs(p.x - cx) < 16) && attempt < 12) {
            attempt++
            cx = center + (attempt % 2 === 0 ? 1 : -1) * Math.min(maxJitter, 8 + attempt * 4)
          }
          placed.push({ y: baseY, x: cx })
          result.push({ student: d, cx, cy: baseY })
        })
    })

    return result
  }, [filtered, classNumbers, isSingleClass])

  const hoveredStudent = hovered ? positioned.find(p => p.student.student.id === hovered) : null

  return (
    <div className="space-y-4">
      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setClassFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
              classFilter === 'all' ? 'bg-primary text-primary-foreground shadow-clarity' : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >כל הכיתות</button>
          {classNumbers.map(n => (
            <button
              key={n}
              onClick={() => setClassFilter(n)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
                classFilter === n ? 'bg-primary text-primary-foreground shadow-clarity' : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >יא{n}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setRiskFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
              riskFilter === 'all' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >הכל</button>
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

      {/* ── SVG ladder ── */}
      <div className="relative rounded-3xl bg-card border border-border/60 shadow-clarity overflow-visible">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`}
          className="w-full h-auto"
          style={{ minHeight: 520 }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Zone backgrounds + labels (right of DOT_AREA_RIGHT) */}
          {ZONES.map(zone => {
            const yTop    = scoreToY(zone.max)
            const yBottom = scoreToY(zone.min)
            return (
              <g key={zone.label}>
                <rect x={DOT_AREA_LEFT} y={yTop} width={DOT_AREA_RIGHT - DOT_AREA_LEFT} height={yBottom - yTop} fill={zone.bg} />
                <line
                  x1={DOT_AREA_LEFT} x2={DOT_AREA_RIGHT} y1={yBottom} y2={yBottom}
                  stroke="rgba(148,163,184,0.25)" strokeDasharray="4 6"
                />
                {/* Zone label in the right margin — never overlaps dots */}
                <text
                  x={DOT_AREA_RIGHT + 12}
                  y={(yTop + yBottom) / 2}
                  fill={zone.accent}
                  fontSize={11}
                  fontWeight={700}
                  dominantBaseline="middle"
                  textAnchor="start"
                >{zone.label}</text>
              </g>
            )
          })}

          {/* Y-axis ticks */}
          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(v => {
            const y       = scoreToY(v)
            const isMajor = v % 20 === 0
            return (
              <g key={v}>
                <text
                  x={DOT_AREA_LEFT - 10} y={y}
                  fill="var(--muted-foreground)"
                  fontSize={isMajor ? 11 : 9}
                  fontWeight={isMajor ? 700 : 500}
                  textAnchor="end"
                  dominantBaseline="middle"
                  opacity={isMajor ? 0.9 : 0.5}
                >{v}</text>
                {isMajor && (
                  <line x1={DOT_AREA_LEFT - 4} x2={DOT_AREA_LEFT} y1={y} y2={y}
                    stroke="var(--muted-foreground)" strokeWidth={1} opacity={0.4} />
                )}
              </g>
            )
          })}

          {/* Class labels at bottom (multi-class) */}
          {!isSingleClass && classNumbers.map((n, i) => {
            const laneW   = (DOT_AREA_RIGHT - DOT_AREA_LEFT) / classNumbers.length
            const centerX = DOT_AREA_LEFT + laneW * i + laneW / 2
            return (
              <text key={n} x={centerX} y={LADDER_HEIGHT - 10}
                fill="var(--muted-foreground)" fontSize={12} fontWeight={700}
                textAnchor="middle" opacity={0.7}>יא{n}</text>
            )
          })}

          {/* Dots (+ score label above + name below in single-class) */}
          {positioned.map((p, i) => {
            const isHovered = hovered === p.student.student.id
            const color     = RISK_COLORS[p.student.result.risk]
            const dotR      = isHovered ? 10 : isSingleClass ? 9 : 7

            return (
              <g
                key={p.student.student.id}
                className="cursor-pointer"
                style={{
                  animation: `ladder-in 0.55s cubic-bezier(0.16,1,0.3,1) both`,
                  animationDelay: `${Math.min(i * 0.02, 1.2)}s`,
                  transformOrigin: `${p.cx}px ${p.cy}px`,
                }}
                onMouseEnter={() => setHovered(p.student.student.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => router.push(`/student/${p.student.student.id}`)}
              >
                {isHovered && <circle cx={p.cx} cy={p.cy} r={16} fill={RISK_RING[p.student.result.risk]} />}

                <circle
                  cx={p.cx} cy={p.cy} r={dotR}
                  fill={color} stroke="white" strokeWidth={2}
                  style={{
                    filter: isHovered ? `drop-shadow(0 4px 10px ${color}80)` : `drop-shadow(0 1px 2px rgba(0,0,0,0.15))`,
                    transition: 'r 0.2s ease, filter 0.2s ease',
                  }}
                />

                {/* Score above dot — only in single-class */}
                {isSingleClass && (
                  <text
                    x={p.cx} y={p.cy - 14}
                    fill={color} fontSize={10} fontWeight={700}
                    textAnchor="middle" dominantBaseline="auto"
                  >{p.student.result.score}</text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Hover tooltip — centered above the dot */}
        {hoveredStudent && (
          <div
            className="pointer-events-none absolute z-10 px-3 py-2 rounded-xl bg-foreground text-background text-xs font-bold shadow-clarity-lg"
            style={{
              left: `${(hoveredStudent.cx / SVG_WIDTH) * 100}%`,
              top: `${(hoveredStudent.cy / svgHeight) * 100}%`,
              transform: 'translate(-50%, -130%)',
              whiteSpace: 'nowrap',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ background: RISK_COLORS[hoveredStudent.student.result.risk] }} />
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
          {isSingleClass && <span className="mr-1 opacity-60">· מסודר א–ת · ציון מעל לנקודה</span>}
        </p>
        <p className="opacity-70">לחץ על נקודה לפתיחת כרטיס תלמיד</p>
      </div>
    </div>
  )
}
