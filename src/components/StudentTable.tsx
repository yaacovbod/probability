'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StudentFullData, RiskLevel } from '@/lib/types'

type Props = {
  data: StudentFullData[]
}

type SortKey = 'fullName' | 'classGroup' | 'score' | 'lashon' | 'tanach' | 'history' | 'english' | 'math' | 'attendance'

function riskBadge(risk: RiskLevel) {
  const map: Record<RiskLevel, string> = {
    'נמוך': 'bg-green-100 text-green-800',
    'בינוני': 'bg-yellow-100 text-yellow-800',
    'גבוה': 'bg-orange-100 text-orange-800',
    'גבוה מאוד': 'bg-red-100 text-red-800',
  }
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[risk]}`}>{risk}</span>
}

function scoreCell(score: number) {
  let color = 'text-red-600'
  if (score >= 80) color = 'text-green-600'
  else if (score >= 65) color = 'text-yellow-600'
  else if (score >= 45) color = 'text-orange-500'
  return <span className={`font-bold ${color}`}>{score}</span>
}

function rowBg(risk: RiskLevel): string {
  if (risk === 'גבוה מאוד') return 'bg-red-50 hover:bg-red-100'
  if (risk === 'גבוה') return 'bg-orange-50 hover:bg-orange-100'
  if (risk === 'בינוני') return 'bg-yellow-50 hover:bg-yellow-100'
  return 'bg-green-50 hover:bg-green-100'
}

const CLASSES = ['הכל', 'יא1', 'יא2', 'יא3', 'יא4', 'יא5', 'יא6']
const RISKS: (RiskLevel | 'הכל')[] = ['הכל', 'נמוך', 'בינוני', 'גבוה', 'גבוה מאוד']

export function StudentTable({ data }: Props) {
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('הכל')
  const [riskFilter, setRiskFilter] = useState<string>('הכל')
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const [sortAsc, setSortAsc] = useState(true)
  const router = useRouter()

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(true) }
  }

  const filtered = useMemo(() => {
    let rows = [...data]
    if (search) rows = rows.filter(d => d.student.fullName.includes(search))
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
    if (prob === undefined || prob === null) return <span className="text-gray-300">—</span>
    if (prob === 0) return <span className="text-red-500 font-bold">0%</span>
    let color = 'text-red-500'
    if (prob >= 80) color = 'text-green-600'
    else if (prob >= 60) color = 'text-yellow-600'
    else if (prob >= 40) color = 'text-orange-500'
    return <span className={color}>{prob}%</span>
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="חיפוש לפי שם..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-48 text-right"
        />
        <Select value={classFilter} onValueChange={(v) => setClassFilter(v ?? 'הכל')}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={(v) => setRiskFilter(v ?? 'הכל')}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            {RISKS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-500">{filtered.length} תלמידים</span>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">ת"ז</TableHead>
              <Th k="fullName" label="שם" />
              <Th k="classGroup" label="כיתה" />
              <TableHead className="text-right">חינ"מ</TableHead>
              <Th k="attendance" label="היעדרויות" />
              <Th k="score" label="סיכוי" />
              <TableHead className="text-right">סיכון</TableHead>
              <Th k="lashon" label="לשון" />
              <Th k="tanach" label='תנ"ך' />
              <Th k="history" label="היסטוריה" />
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
                  className={`${rowBg(d.result.risk)} cursor-pointer`}
                  onClick={() => router.push(`/student/${d.student.id}`)}
                >
                  <TableCell className="text-gray-500 text-sm">{d.student.id}</TableCell>
                  <TableCell className="font-medium">{d.student.fullName}</TableCell>
                  <TableCell>יא{d.student.classGroup.replace(/.*?(\d+)$/, '$1')}</TableCell>
                  <TableCell>{d.student.isSpecialEd ? '★' : ''}</TableCell>
                  <TableCell>
                    {absence !== null ? (
                      <span className={absence > 25 ? 'text-red-600 font-bold' : ''}>{Math.round(absence)}%</span>
                    ) : '—'}
                  </TableCell>
                  <TableCell>{scoreCell(d.result.score)}</TableCell>
                  <TableCell>{riskBadge(d.result.risk)}</TableCell>
                  <TableCell>{subjectCell(d.result.subjectProbs.lashon)}</TableCell>
                  <TableCell>{subjectCell(d.result.subjectProbs.tanach)}</TableCell>
                  <TableCell>{subjectCell(d.result.subjectProbs.history)}</TableCell>
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
