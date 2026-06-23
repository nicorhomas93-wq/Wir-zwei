import type { PlanEvent } from '../types'

export function comparePlanEvents(a: PlanEvent, b: PlanEvent): number {
  const aOpen = !a.date
  const bOpen = !b.date

  if (aOpen && bOpen) {
    return b.createdAt.localeCompare(a.createdAt)
  }
  if (aOpen) return 1
  if (bOpen) return -1

  const dateCmp = a.date!.localeCompare(b.date!)
  if (dateCmp !== 0) return dateCmp

  if (a.time && b.time) return a.time.localeCompare(b.time)
  if (a.time) return -1
  if (b.time) return 1

  return a.createdAt.localeCompare(b.createdAt)
}

export function sortPlanEvents(events: PlanEvent[]): PlanEvent[] {
  return [...events].sort(comparePlanEvents)
}

export function hasPlanDate(event: PlanEvent): event is PlanEvent & { date: string } {
  return Boolean(event.date)
}
