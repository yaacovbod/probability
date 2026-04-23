import { RiskLevel } from './types'

export const RISK_LABEL_ORDER: RiskLevel[] = ['גבוה מאוד', 'גבוה', 'בינוני', 'נמוך מאוד']

export const RISK_HEX_COLORS: Record<RiskLevel, string> = {
  'גבוה מאוד': '#10B981',
  'גבוה': '#0891B2',
  'בינוני': '#F59E0B',
  'נמוך מאוד': '#EF4444',
}

export const RISK_BADGE_CLASSES: Record<RiskLevel, string> = {
  'גבוה מאוד': 'bg-green-200 text-green-900',
  'גבוה': 'bg-green-100 text-green-800',
  'בינוני': 'bg-yellow-100 text-yellow-800',
  'נמוך מאוד': 'bg-red-100 text-red-800',
}
