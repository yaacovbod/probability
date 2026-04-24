'use client'
import { useState, useRef, useEffect } from 'react'
import { StudentFullData } from '@/lib/types'
import { DashboardKPI } from '@/components/DashboardKPI'
import { RiskCharts } from '@/components/RiskCharts'
import { StudentsView } from '@/components/StudentsView'
import { BorderlineStudents } from '@/components/BorderlineStudents'
import { ExamCountdown } from '@/components/ExamCountdown'
import { SubjectSummary } from '@/components/SubjectSummary'
import { ClassComparison } from '@/components/ClassComparison'
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react'

type SectionId = 'kpi' | 'countdown' | 'riskcharts' | 'borderline' | 'subject' | 'class' | 'students'

const DEFAULT_ORDER: SectionId[] = ['kpi', 'countdown', 'riskcharts', 'borderline', 'subject', 'class', 'students']

const SECTION_LABELS: Record<SectionId, string> = {
  kpi: 'סיכום',
  countdown: 'ספירה לאחור לבגרויות',
  riskcharts: 'גרפי סיכון',
  borderline: 'תלמידים בגבול',
  subject: 'סיכום מקצועות',
  class: 'השוואת כיתות',
  students: 'תצוגת תלמידים',
}

const STORAGE_ORDER_KEY = 'dashboard-section-order'
const STORAGE_OPEN_KEY = 'dashboard-section-open'

type Props = { data: StudentFullData[] }

export function DraggableDashboard({ data }: Props) {
  const [order, setOrder] = useState<SectionId[]>(DEFAULT_ORDER)
  const [open, setOpen] = useState<Record<SectionId, boolean>>(
    Object.fromEntries(DEFAULT_ORDER.map(id => [id, true])) as Record<SectionId, boolean>
  )
  const [dragging, setDragging] = useState<SectionId | null>(null)
  const [dragOver, setDragOver] = useState<SectionId | null>(null)

  const dragItem = useRef<SectionId | null>(null)
  const dragOverItem = useRef<SectionId | null>(null)

  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem(STORAGE_ORDER_KEY)
      if (savedOrder) {
        const parsed = JSON.parse(savedOrder) as SectionId[]
        const valid = parsed.filter(id => DEFAULT_ORDER.includes(id))
        const missing = DEFAULT_ORDER.filter(id => !valid.includes(id))
        setOrder([...valid, ...missing])
      }
      const savedOpen = localStorage.getItem(STORAGE_OPEN_KEY)
      if (savedOpen) {
        setOpen(prev => ({ ...prev, ...JSON.parse(savedOpen) }))
      }
    } catch {}
  }, [])

  const saveOrder = (newOrder: SectionId[]) => {
    localStorage.setItem(STORAGE_ORDER_KEY, JSON.stringify(newOrder))
    setOrder(newOrder)
  }

  const toggleOpen = (id: SectionId) => {
    setOpen(prev => {
      const newOpen = { ...prev, [id]: !prev[id] }
      localStorage.setItem(STORAGE_OPEN_KEY, JSON.stringify(newOpen))
      return newOpen
    })
  }

  const handleDragStart = (id: SectionId) => {
    dragItem.current = id
    setDragging(id)
  }

  const handleDragEnter = (id: SectionId) => {
    dragOverItem.current = id
    setDragOver(id)
  }

  const handleDragEnd = () => {
    if (dragItem.current && dragOverItem.current && dragItem.current !== dragOverItem.current) {
      const newOrder = [...order]
      const from = newOrder.indexOf(dragItem.current)
      const to = newOrder.indexOf(dragOverItem.current)
      newOrder.splice(from, 1)
      newOrder.splice(to, 0, dragItem.current!)
      saveOrder(newOrder)
    }
    dragItem.current = null
    dragOverItem.current = null
    setDragging(null)
    setDragOver(null)
  }

  const renderSection = (id: SectionId) => {
    switch (id) {
      case 'kpi':        return <DashboardKPI data={data} />
      case 'countdown':  return <ExamCountdown data={data} />
      case 'riskcharts': return <RiskCharts data={data} />
      case 'borderline': return <BorderlineStudents data={data} />
      case 'subject':    return <SubjectSummary data={data} />
      case 'class':      return <ClassComparison data={data} />
      case 'students':   return <StudentsView data={data} />
    }
  }

  const allOpen = order.every(id => open[id])

  const toggleAll = () => {
    const newOpen = Object.fromEntries(DEFAULT_ORDER.map(id => [id, !allOpen])) as Record<SectionId, boolean>
    localStorage.setItem(STORAGE_OPEN_KEY, JSON.stringify(newOpen))
    setOpen(newOpen)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={toggleAll}
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full border border-border/50 hover:border-border bg-card"
        >
          {allOpen ? 'סגור הכל' : 'פתח הכל'}
        </button>
      </div>
      {order.map(id => {
        const isDraggingThis = dragging === id
        const isDragTarget = dragOver === id && dragging !== id
        return (
          <div
            key={id}
            draggable
            onDragStart={() => handleDragStart(id)}
            onDragEnter={() => handleDragEnter(id)}
            onDragEnd={handleDragEnd}
            onDragOver={e => e.preventDefault()}
            className={`rounded-2xl border bg-card shadow-sm overflow-hidden transition-all duration-200 ${
              isDraggingThis ? 'opacity-40 scale-[0.99]' : ''
            } ${isDragTarget ? 'border-primary border-2 ring-1 ring-primary/20' : 'border-border/50'}`}
          >
            <div
              className="flex items-center justify-between px-4 py-3 select-none bg-muted/20 hover:bg-muted/40 transition-colors border-b border-border/30"
              onClick={() => toggleOpen(id)}
            >
              <div className="flex items-center gap-2 cursor-pointer">
                <span className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  <GripVertical className="w-4 h-4" />
                </span>
                <span className="font-bold text-sm text-foreground">{SECTION_LABELS[id]}</span>
              </div>
              <span className="cursor-pointer text-muted-foreground">
                {open[id]
                  ? <ChevronUp className="w-4 h-4" />
                  : <ChevronDown className="w-4 h-4" />
                }
              </span>
            </div>
            {open[id] && (
              <div className="p-4 sm:p-6">
                {renderSection(id)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
