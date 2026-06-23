export const PENALTY_POINTS = 1 as const

export interface PenaltyDefinition {
  id: string
  paragraph: string
  title: string
  description: string
  category?: string
}

/** Alle Strafen geben exakt 1 Punkt — siehe PENALTY_POINTS */
export const STRAFKATALOG: PenaltyDefinition[] = [
  {
    id: 's-late',
    paragraph: '§A1',
    title: 'Zu spät geantwortet',
    description: 'Die Nachricht lag zu lange unbearbeitet — ohne kurzes Zeichen.',
    category: 'Alltag',
  },
  {
    id: 's-frech',
    paragraph: '§A2',
    title: 'Frech gewesen',
    description: 'Ein frecher Ton, ein Seitenhieb oder bewusst provokante Worte.',
    category: 'Alltag',
  },
  {
    id: 's-provokation',
    paragraph: '§A3',
    title: 'Kleine Provokation',
    description: 'Leichtes Ärgern, Necken über die Grenze oder absichtliches Reizen.',
    category: 'Alltag',
  },
  {
    id: 's-wiedergutmachung',
    paragraph: '§A4',
    title: 'Extra Wiedergutmachung nötig',
    description: 'Es braucht mehr als ein kurzes Sorry — eine liebevolle Geste ist fällig.',
    category: 'Versöhnung',
  },
  {
    id: 's-widerspruch',
    paragraph: '§S1',
    title: 'Widerspruch = verloren',
    description: 'Widerspruch = verloren ❤️',
    category: 'Strafenkatalog',
  },
  {
    id: 's-liebe',
    paragraph: '§S2',
    title: '3× Ich liebe dich pro Stunde',
    description: "3× 'Ich liebe dich' pro Stunde 🔐",
    category: 'Strafenkatalog',
  },
  {
    id: 's-kuscheln',
    paragraph: '§S3',
    title: 'Kuschelpflicht ohne Limit',
    description: 'Kuschelpflicht ohne Limit 💍',
    category: 'Strafenkatalog',
  },
  {
    id: 's-kuesse',
    paragraph: '§S4',
    title: 'Mindestens 10 Küsse',
    description: 'Mindestens 10 Küsse 💋',
    category: 'Strafenkatalog',
  },
  {
    id: 's-exklusiv',
    paragraph: '§S5',
    title: 'Für immer exklusiv',
    description: 'Für immer exklusiv ♾️',
    category: 'Strafenkatalog',
  },
]

export const PENALTY_CATEGORIES = ['Alltag', 'Versöhnung', 'Strafenkatalog'] as const
