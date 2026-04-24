import Link from 'next/link'
import { getStudentsData } from '@/lib/data'
import { DraggableDashboard } from '@/components/DraggableDashboard'
import { Button } from '@/components/ui/button'

export const revalidate = 60

export default async function DashboardPage() {
  const data = await getStudentsData()

  if (data.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4" dir="rtl">
        <div className="rounded-3xl bg-card border border-border/50 shadow-clarity p-10 text-center max-w-md">
          <h1 className="text-2xl font-black text-foreground mb-2">אין נתונים להצגה</h1>
          <p className="text-muted-foreground mb-6">יש להעלות קובץ Excel כדי להתחיל לעקוב אחרי סיכויי הבגרות</p>
          <Link href="/upload">
            <Button className="rounded-full shadow-clarity">העלאת Excel</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main dir="rtl" className="max-w-7xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 animate-fade-up">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            נעימת הלב · חריש
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
            דשבורד בגרות
            <span className="block text-primary">מחזור ג׳</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base font-medium">
            מעקב אחרי סיכויי הצלחה של {data.length} תלמידים
          </p>
        </div>
        <Link href="/upload">
          <Button variant="outline" className="rounded-full gap-2 shrink-0">
            <span>⬆</span>
            עדכן Excel
          </Button>
        </Link>
      </header>

      <DraggableDashboard data={data} />
    </main>
  )
}
