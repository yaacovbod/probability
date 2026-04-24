'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden text-sm text-muted-foreground hover:text-foreground border border-border/60 rounded-full px-3 py-1.5 transition-colors"
    >
      🖨 הדפס
    </button>
  )
}
