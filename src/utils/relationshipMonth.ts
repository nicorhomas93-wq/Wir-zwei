import { RELATIONSHIP_START } from '../constants/relationship'

export const RELATIONSHIP_ANCHOR_DAY = 30

export function clampRelationshipDay(year: number, month: number, anchorDay: number): number {
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate()
  return Math.min(anchorDay, lastDayOfMonth)
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
}

function anniversaryForMonth(year: number, month: number, anchorDay: number): Date {
  const day = clampRelationshipDay(year, month, anchorDay)
  return new Date(year, month, day, 0, 0, 0, 0)
}

/** Alle fälligen Beziehungsmonats-Jubiläen nach dem Start, bis einschließlich `until`. */
export function getDueAnniversaries(
  until: Date = new Date(),
  lastProcessed: string | null,
  anchorDay = RELATIONSHIP_ANCHOR_DAY
): Date[] {
  const untilDay = startOfDay(until)
  const lastProcessedDate = lastProcessed ? parseDateKey(lastProcessed) : null
  const due: Date[] = []

  const cursor = new Date(RELATIONSHIP_START)
  cursor.setMonth(cursor.getMonth() + 1)

  while (true) {
    const anniversary = anniversaryForMonth(cursor.getFullYear(), cursor.getMonth(), anchorDay)
    if (anniversary > untilDay) break

    if (!lastProcessedDate || anniversary > lastProcessedDate) {
      due.push(anniversary)
    }

    cursor.setMonth(cursor.getMonth() + 1)
  }

  return due
}

/** Nächstes Beziehungsmonats-Jubiläum ab `from` (exklusive heute, wenn heute schon Jubiläum war). */
export function getNextRelationshipAnniversary(
  from: Date = new Date(),
  anchorDay = RELATIONSHIP_ANCHOR_DAY
): Date {
  const fromDay = startOfDay(from)
  const cursor = new Date(RELATIONSHIP_START)
  cursor.setMonth(cursor.getMonth() + 1)

  while (true) {
    const anniversary = anniversaryForMonth(cursor.getFullYear(), cursor.getMonth(), anchorDay)
    if (anniversary > fromDay) return anniversary
    cursor.setMonth(cursor.getMonth() + 1)
  }
}

export function formatAnniversaryLabel(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function getCurrentRelationshipMonthIndex(today: Date = new Date()): number {
  const todayDay = startOfDay(today)
  if (todayDay < RELATIONSHIP_START) return 0

  let index = 1
  const cursor = new Date(RELATIONSHIP_START)
  cursor.setMonth(cursor.getMonth() + 1)

  while (true) {
    const anniversary = anniversaryForMonth(cursor.getFullYear(), cursor.getMonth(), RELATIONSHIP_ANCHOR_DAY)
    if (anniversary > todayDay) return index
    index += 1
    cursor.setMonth(cursor.getMonth() + 1)
  }
}
