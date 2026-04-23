export function scoreHexColor(score: number): string {
  if (score >= 85) return '#10B981'
  if (score >= 70) return '#0891B2'
  if (score >= 45) return '#F59E0B'
  return '#EF4444'
}

export function scoreBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 65) return 'bg-yellow-400'
  if (score >= 45) return 'bg-orange-400'
  return 'bg-red-500'
}

export function scoreTextColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 65) return 'text-yellow-600'
  if (score >= 45) return 'text-orange-500'
  return 'text-red-600'
}
