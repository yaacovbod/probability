'use client'
import Link from 'next/link'
import { StudentFullData } from '@/lib/types'

type Props = { data: StudentFullData[] }

function hasAnyMajor(s: StudentFullData): boolean {
  const b = s.bagrut
  const majorBagrut = [
    b.major_bio, b.major_psychology, b.major_physics, b.major_data,
    b.major_art, b.major_communication, b.major_chemistry,
    b.major_cs, b.major_business, b.major_motal, b.major_languages,
  ].some(v => v !== null)
  return majorBagrut || s.school.majorSubject !== null
}

export function NoMajorStudents({ data }: Props) {
  const noMajor = data.filter(s => !hasAnyMajor(s))

  if (noMajor.length === 0) return null

  return (
    <div className="rounded-3xl border border-amber-200/70 bg-amber-50/40 p-6 shadow-clarity animate-fade-up">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-black text-foreground text-lg">תלמידים ללא שיוך מגמה</h2>
        <span className="text-xs font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full">
          {noMajor.length}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        אין ציון בגרות ואין ציון תעודה בשום מגמה
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {noMajor.map(s => (
          <Link
            key={s.student.id}
            href={`/student/${s.student.id}`}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/70 border border-amber-100 hover:border-amber-300 hover:bg-white transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold truncate">{s.student.fullName}</span>
              {s.student.isSpecialEd && <span className="text-amber-500 text-[10px] shrink-0">★</span>}
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0 mr-2">
              יא{s.student.classGroup.replace(/.*?(\d+)$/, '$1')}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
