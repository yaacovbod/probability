import { RiskLevel } from './types'

export const RISK_LABEL_ORDER: RiskLevel[] = ['גבוה מאוד', 'גבוה', 'בינוני', 'נמוך', 'נמוך מאוד']

export const RISK_HEX_COLORS: Record<RiskLevel, string> = {
  'גבוה מאוד': '#0891B2',
  'גבוה': '#10B981',
  'בינוני': '#EAB308',
  'נמוך': '#F97316',
  'נמוך מאוד': '#EF4444',
}

export const RISK_BADGE_CLASSES: Record<RiskLevel, string> = {
  'גבוה מאוד': 'bg-cyan-100 text-cyan-900',
  'גבוה': 'bg-green-100 text-green-800',
  'בינוני': 'bg-yellow-100 text-yellow-800',
  'נמוך': 'bg-orange-100 text-orange-800',
  'נמוך מאוד': 'bg-red-100 text-red-800',
}
