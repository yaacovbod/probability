import { NextResponse } from 'next/server'
import { getStudentsData } from '@/lib/data'

export const revalidate = 60

export async function GET() {
  try {
    const data = await getStudentsData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Google Sheets error:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת הנתונים מ-Google Sheets' }, { status: 500 })
  }
}
