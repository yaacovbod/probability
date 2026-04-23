'use client'

type ViewMode = 'ladder' | 'table'

type Props = {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewToggle({ value, onChange }: Props) {
  const options: { key: ViewMode; label: string; icon: string }[] = [
    { key: 'ladder', label: 'סולם', icon: '⇅' },
    { key: 'table', label: 'טבלה', icon: '☷' },
  ]
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1 border border-border/50">
      {options.map(opt => {
        const active = value === opt.key
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            aria-pressed={active}
            className={`relative flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-full transition-all ${
              active
                ? 'bg-card text-primary shadow-clarity'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="text-base leading-none">{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
