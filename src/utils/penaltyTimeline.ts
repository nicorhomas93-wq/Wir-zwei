import type { AppData, PenaltyApplication, PenaltyMonthReset } from '../types'
import { formatDateTime } from './formatDate'
import { parseDateKey } from './relationshipMonth'

export interface TimelineEntry {
  id: string
  at: string
  label: string
  delta: number
  kind: PenaltyApplication['kind'] | 'monatsabzug'
  targetUserName: string
  appliedByUserName: string
  sortTime: number
}

function inferKind(entry: PenaltyApplication): PenaltyApplication['kind'] {
  if (entry.kind) return entry.kind
  if (entry.penaltyId.startsWith('w-') || entry.penaltyId === 'manual-deduct') return 'wiedergutmachung'
  if (entry.points < 0) return 'wiedergutmachung'
  return 'strafe'
}

function monthEntries(history: PenaltyMonthReset[]): TimelineEntry[] {
  const rows: TimelineEntry[] = []

  for (const month of history) {
    const marieDelta = month.scoresBefore.marie - month.scoresAfter.marie
    const nicoDelta = month.scoresBefore.nico - month.scoresAfter.nico
    const sortTime = new Date(month.processedAt).getTime()

    if (marieDelta > 0) {
      rows.push({
        id: `${month.id}-marie`,
        at: month.processedAt,
        label: 'Automatischer Beziehungsmonat-Abzug',
        delta: -marieDelta,
        kind: 'monatsabzug',
        targetUserName: 'Marie',
        appliedByUserName: 'System',
        sortTime,
      })
    }

    if (nicoDelta > 0) {
      rows.push({
        id: `${month.id}-nico`,
        at: month.processedAt,
        label: 'Automatischer Beziehungsmonat-Abzug',
        delta: -nicoDelta,
        kind: 'monatsabzug',
        targetUserName: 'Nico',
        appliedByUserName: 'System',
        sortTime,
      })
    }
  }

  return rows
}

export function buildPenaltyTimeline(data: Pick<
  AppData,
  'penaltyApplications' | 'penaltyMonthHistory'
>): TimelineEntry[] {
  const fromApps: TimelineEntry[] = data.penaltyApplications.map((entry) => ({
    id: entry.id,
    at: entry.appliedAt,
    label: entry.title,
    delta: entry.points,
    kind: inferKind(entry),
    targetUserName: entry.targetUserName,
    appliedByUserName: entry.appliedByUserName,
    sortTime: new Date(entry.appliedAt).getTime(),
  }))

  return [...fromApps, ...monthEntries(data.penaltyMonthHistory)]
    .sort((a, b) => b.sortTime - a.sortTime)
    .slice(0, 40)
}

export function formatTimelineDelta(delta: number): string {
  if (delta > 0) return `+${delta}`
  return `${delta}`
}

export function formatTimelineLine(entry: TimelineEntry): string {
  const when = formatDateTime(entry.at)
  return `${formatTimelineDelta(entry.delta)} ${entry.label} · ${entry.targetUserName} · ${when}`
}

export function formatMonthLabel(dateKey: string): string {
  return parseDateKey(dateKey).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
