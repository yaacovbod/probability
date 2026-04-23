import { NextRequest, NextResponse } from 'next/server'
import { parseExcel } from '@/lib/excel-parser'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'לא נשלח קובץ' }, { status: 400 })

    const buffer = await file.arrayBuffer()
    const parsed = parseExcel(buffer)

    return NextResponse.json({
      students: parsed.students,
      bagrutScores: parsed.bagrutScores,
      schoolGrades: parsed.schoolGrades,
      counts: {
        students: parsed.students.length,
        bagrutRows: parsed.bagrutScores.length,
        schoolRows: parsed.schoolGrades.length,
      },
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
