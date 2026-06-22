const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateKey(key: string): Date {
  return new Date(`${key}T12:00:00`)
}

export function isSameDateKey(a: string, b: string): boolean {
  return a === b
}

export function isTodayKey(key: string): boolean {
  return isSameDateKey(key, toDateKey(new Date()))
}

export function getMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric',
  })
}

export function getCalendarDays(year: number, month: number): Array<Date | null> {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = (firstDay.getDay() + 6) % 7
  const days: Array<Date | null> = []

  for (let i = 0; i < startOffset; i++) days.push(null)

  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day))
  }

  while (days.length % 7 !== 0) days.push(null)

  return days
}

export { WEEKDAYS }
