export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatEventDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatPlanEventSchedule(event: { date?: string; time?: string }): string {
  if (!event.date) return 'Offen'

  const dateLabel = new Date(`${event.date}T12:00:00`).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  if (event.time) return `${dateLabel} · ${event.time}`
  return dateLabel
}

export function isToday(date: string): boolean {
  const today = new Date()
  const eventDate = new Date(`${date}T12:00:00`)
  return today.toDateString() === eventDate.toDateString()
}
