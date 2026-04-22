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
      <body className="font-[family-name:var(--font-heebo)] bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  )
}
