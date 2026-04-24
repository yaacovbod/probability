'use client'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StudentFullData, RiskLevel } from '@/lib/types'
import { scoreTextColor } from '@/lib/styling'

type Props = {
  data: StudentFullData[]
  urlRiskFilter?: RiskLevel | null
}

type SortKey = 'fullName' | 'classGroup' | 'score' | 'lashon' | 'tanach' | 'history' | 'civics' | 'literature' | 'major' | 'english' | 'math' | 'attendance'

function riskBadge(risk: RiskLevel) {
  const map: Record<RiskLevel, { bg: string; dot: string }> = {
    'גבוה מאוד': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    'גבוה': { bg: 'bg-primary/10 text-primary border-primary/20', dot: 'bg-primary' },
    'בינוני': { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    'נמוך מאוד': { bg: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive' },
  }
  const style = map[risk]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${style.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {risk}
    </span>
  )
}

function scoreCell(score: number) {
  return <span className={`text-lg font-black tabular-nums ${scoreTextColor(score)}`}>{score}</span>
}

function rowHover(): string {
  return 'hover:bg-accent/40 transition-colors'
}

const CLASSES = ['הכל', 'יא1', 'יא2', 'יא3', 'יא4', 'יא5', 'יא6']
const RISKS: (RiskLevel | 'הכל')[] = ['הכל', 'גבוה מאוד', 'גבוה', 'בינוני', 'נמוך מאוד']

export function StudentTable({ data, urlRiskFilter }: Props) {
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('הכל')
  const [riskFilter, setRiskFilter] = useState<string>(urlRiskFilter ?? 'הכל')

  useEffect(() => {
    setRiskFilter(urlRiskFilter ?? 'הכל')
  }, [urlRiskFilter])
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const [sortAsc, setSortAsc] = useState(true)
  const router = useRouter()

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(true) }
  }

  const filtered = useMemo(() => {
    let rows = [...data]
    if (search) rows = rows.filter(d => d.student.fullName.includes(search) || d.student.id.includes(search))
    if (classFilter !== 'הכל') rows = rows.filter(d => d.student.classGroup.includes(classFilter.replace('יא', "יא'")))
    if (riskFilter !== 'הכל') rows = rows.filter(d => d.result.risk === riskFilter)

    rows.sort((a, b) => {
      let va: number | string = 0, vb: number | string = 0
      if (sortKey === 'fullName') { va = a.student.fullName; vb = b.student.fullName }
      else if (sortKey === 'classGroup') { va = a.student.classGroup; vb = b.student.classGroup }
      else if (sortKey === 'score') { va = a.result.score; vb = b.result.score }
      else if (sortKey === 'lashon') { va = a.result.subjectProbs.lashon ?? -1; vb = b.result.subjectProbs.lashon ?? -1 }
      else if (sortKey === 'tanach') { va = a.result.subjectProbs.tanach ?? -1; vb = b.result.subjectProbs.tanach ?? -1 }
      else if (sortKey === 'history') { va = a.result.subjectProbs.history ?? -1; vb = b.result.subjectProbs.history ?? -1 }
      else if (sortKey === 'english') { va = a.result.subjectProbs.english ?? -1; vb = b.result.subjectProbs.english ?? -1 }
      else if (sortKey === 'civics') { va = a.result.subjectProbs.civics ?? -1; vb = b.result.subjectProbs.civics ?? -1 }
      else if (sortKey === 'literature') { va = a.result.subjectProbs.literature ?? -1; vb = b.result.subjectProbs.literature ?? -1 }
      else if (sortKey === 'major') { va = a.result.subjectProbs.major ?? -1; vb = b.result.subjectProbs.major ?? -1 }
      else if (sortKey === 'math') { va = a.result.subjectProbs.math ?? -1; vb = b.result.subjectProbs.math ?? -1 }
      else if (sortKey === 'attendance') { va = a.student.attendanceAbsencePct ?? -1; vb = b.student.attendanceAbsencePct ?? -1 }
      if (va < vb) return sortAsc ? -1 : 1
      if (va > vb) return sortAsc ? 1 : -1
      return 0
    })
    return rows
  }, [data, search, classFilter, riskFilter, sortKey, sortAsc])

  function Th({ k, label }: { k: SortKey; label: string }) {
    return (
      <TableHead
        className="cursor-pointer select-none whitespace-nowrap text-right"
        onClick={() => toggleSort(k)}
      >
        {label} {sortKey === k ? (sortAsc ? '↑' : '↓') : ''}
      </TableHead>
    )
  }

  function subjectCell(prob: number | null | undefined) {
    if (prob === undefined || prob === null) return <span className="text-muted-foreground/40">—</span>
    if (prob === 0) return <span className="text-destructive font-bold">0%</span>
    let color = 'text-destructive'
    if (prob >= 80) color = 'text-emerald-600'
    else if (prob >= 60) color = 'text-primary'
    else if (prob >= 40) color = 'text-amber-600'
    return <span className={`${color} font-semibold tabular-nums`}>{prob}%</span>
  }

  function downloadCSV() {
    const header = ['ת"ז', 'שם', 'כיתה', 'חנ"מ', 'היעדרות%', 'ציון', 'סיכוי', 'לשון', 'תנ"ך', 'היסטוריה', 'אנגלית', 'מתמטיקה']
    const rows = filtered.map(d => [
      d.student.id,
      d.student.fullName,
      d.student.classGroup,
      d.student.isSpecialEd ? 'כן' : '',
      d.student.attendanceAbsencePct !== null ? Math.round(d.student.attendanceAbsencePct) : '',
      d.result.score,
      d.result.risk,
      d.result.subjectProbs.lashon ?? '',
      d.result.subjectProbs.tanach ?? '',
      d.result.subjectProbs.history ?? '',
      d.result.subjectProbs.english ?? '',
      d.result.subjectProbs.math ?? '',
    ])
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bagrut-dashboard-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="חיפוש לפי שם או ת&quot;ז..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-56 text-right rounded-full bg-muted/60 border-0 focus-visible:ring-2 focus-visible:ring-primary"
        />
        <Select value={classFilter} onValueChange={(v) => setClassFilter(v ?? 'הכל')}>
          <SelectTrigger className="w-32 rounded-full bg-muted/60 border-0"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={(v) => setRiskFilter(v ?? 'הכל')}>
          <SelectTrigger className="w-40 rounded-full bg-muted/60 border-0"><SelectValue /></SelectTrigger>
          <SelectContent>
            {RISKS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground mr-auto">
          <span className="font-bold text-foreground">{filtered.length}</span> תלמידים
        </span>
        <button
          onClick={downloadCSV}
          className="text-xs text-muted-foreground hover:text-foreground border border-border/60 rounded-full px-3 py-1.5 transition-colors shrink-0"
        >
          ↓ ייצוא CSV
        </button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card shadow-clarity overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/60 hover:bg-transparent">
              <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">ת"ז</TableHead>
              <Th k="fullName" label="שם" />
              <Th k="classGroup" label="כיתה" />
              <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">חנ"מ</TableHead>
              <Th k="attendance" label="היעדרויות" />
              <Th k="score" label="ציון" />
              <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">סיכוי</TableHead>
              <Th k="lashon" label="לשון" />
              <Th k="tanach" label='תנ"ך' />
              <Th k="history" label="היסטוריה" />
              <Th k="civics" label="אזרחות" />
              <Th k="literature" label="ספרות" />
              <Th k="major" label="מגמה" />
              <Th k="english" label="אנגלית" />
              <Th k="math" label="מתמטיקה" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(d => {
              const absence = d.student.attendanceAbsencePct
              return (
                <TableRow
                  key={d.student.id}
                  className={`${rowHover()} cursor-pointer border-b border-border/30 last:border-0`}
                  onClick={() => router.push(`/student/${d.student.id}`)}
                >
                  <TableCell className="text-muted-foreground text-xs tabular-nums">{d.student.id}</TableCell>
                  <TableCell className="font-bold">{d.student.fullName}</TableCell>
                  <TableCell className="text-sm">יא{d.student.classGroup.replace(/.*?(\d+)$/, '$1')}</TableCell>
                  <TableCell>{d.student.isSpecialEd ? <span className="text-amber-500">★</span> : ''}</TableCell>
                  <TableCell>
                    {absence !== null ? (
                      <span className={`tabular-nums ${absence > 25 ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>{Math.round(absence)}%</span>
                    ) : <span className="text-muted-foreground/40">—</span>}
                  </TableCell>
                  <TableCell>{scoreCell(d.result.score)}</TableCell>
                  <TableCell>{riskBadge(d.result.risk)}</TableCell>
                  <TableCell>{subjectCell(d.result.subjectProbs.lashon)}</TableCell>
                  <TableCell>{subjectCell(d.result.subjectProbs.tanach)}</TableCell>
                  <TableCell>{subjectCell(d.result.subjectProbs.history)}</TableCell>
                  <TableCell>{subjectCell(d.result.subjectProbs.civics)}</TableCell>
                  <TableCell>{subjectCell(d.result.subjectProbs.literature)}</TableCell>
                  <TableCell>{subjectCell(d.result.subjectProbs.major)}</TableCell>
                  <TableCell>{subjectCell(d.result.subjectProbs.english)}</TableCell>
                  <TableCell>{subjectCell(d.result.subjectProbs.math)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
