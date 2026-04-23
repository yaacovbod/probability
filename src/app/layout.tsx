import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import './globals.css'

const heebo = Heebo({ subsets: ['hebrew', 'latin'], variable: '--font-heebo' })

export const metadata: Metadata = {
  title: 'דשבורד בגרות — שכבת יא׳',
  description: 'מעקב סיכויי בגרות — נעימת הלב חריש',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="font-[family-name:var(--font-heebo)] bg-background text-foreground antialiased min-h-screen">
        <div className="relative isolate min-h-screen">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-gradient-to-b from-clarity-cyanSoft/60 via-background to-background" />
          <div className="pointer-events-none absolute inset-0 -z-10 clarity-grid-bg opacity-40" />
          {children}
        </div>
      </body>
    </html>
  )
}
