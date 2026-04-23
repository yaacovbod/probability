'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function UploadPage() {
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'preview' | 'done' | 'error'>('idle')
  const [preview, setPreview] = useState<{ students: number; bagrutRows: number; schoolRows: number } | null>(null)
  const [parsedData, setParsedData] = useState<{ students: unknown[]; bagrutScores: unknown[]; schoolGrades: unknown[] } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleFile(file: File) {
    if (!file.name.endsWith('.xlsx')) {
      setError('יש להעלות קובץ XLSX בלבד')
      setStatus('error')
      return
    }
    setStatus('loading')
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'שגיאה בקריאת הקובץ')
      setStatus('error')
      return
    }

    setParsedData({ students: json.students, bagrutScores: json.bagrutScores, schoolGrades: json.schoolGrades })
    setPreview(json.counts)
    setStatus('preview')
  }

  function handleConfirm() {
    setStatus('done')
    setTimeout(() => router.push('/'), 1500)
  }

  return (
    <main dir="rtl" className="max-w-xl mx-auto px-4 py-16 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">העלאת קובץ Excel</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">גרור קובץ XLSX לכאן</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              dragging ? 'border-cyan-500 bg-cyan-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          >
            <p className="text-gray-500">לחץ או גרור קובץ Excel</p>
            <p className="text-xs text-gray-400 mt-1">פורמט: XLSX עם גיליונות תלמידים, ציוני_בגרות, ציוני_תעודה</p>
          </div>
          <input ref={inputRef} type="file" accept=".xlsx" className="hidden" dir="rtl" aria-label="בחירת קובץ Excel" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        </CardContent>
      </Card>

      {status === 'loading' && <p className="text-center text-gray-500">מעבד קובץ...</p>}

      {status === 'error' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 text-red-600">{error}</CardContent>
        </Card>
      )}

      {status === 'preview' && preview && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader><CardTitle className="text-base">תצוגה מקדימה</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            <p>תלמידים שזוהו: <strong>{preview.students}</strong></p>
            <p>שורות ציוני בגרות: <strong>{preview.bagrutRows}</strong></p>
            <p>שורות ציוני תעודה: <strong>{preview.schoolRows}</strong></p>
            <div className="pt-3 flex gap-2">
              <Button onClick={handleConfirm} className="bg-cyan-600 hover:bg-cyan-700">אשר ועדכן</Button>
              <Button variant="outline" onClick={() => { setStatus('idle'); setParsedData(null); setPreview(null) }}>ביטול</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'done' && (
        <p className="text-center text-green-600 font-medium">הנתונים נשמרו. מעביר לדשבורד...</p>
      )}
    </main>
  )
}
