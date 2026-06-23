import type { PlanEvent } from '../types'
import { toDateKey } from './calendar'
import { sortPlanEvents } from './planEvents'

export type PlanGroupKey = 'heute' | 'morgen' | 'woche' | 'spaeter' | 'offen'

export interface PlanGroup {
  key: PlanGroupKey
  label: string
  events: PlanEvent[]
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function endOfWeek(date: Date): Date {
  const end = new Date(date)
  const day = end.getDay() || 7
  end.setDate(end.getDate() + (7 - day))
  return end
}

export function groupPlanEvents(events: PlanEvent[], now = new Date()): PlanGroup[] {
  const todayKey = toDateKey(now)
  const tomorrowKey = toDateKey(addDays(now, 1))
  const weekEndKey = toDateKey(endOfWeek(now))

  const sorted = sortPlanEvents(events.filter((event) => !event.done))
  const groups: Record<PlanGroupKey, PlanEvent[]> = {
    heute: [],
    morgen: [],
    woche: [],
    spaeter: [],
    offen: [],
  }

  for (const event of sorted) {
    if (!event.date) {
      groups.offen.push(event)
      continue
    }
    if (event.date === todayKey) {
      groups.heute.push(event)
    } else if (event.date === tomorrowKey) {
      groups.morgen.push(event)
    } else if (event.date <= weekEndKey) {
      groups.woche.push(event)
    } else {
      groups.spaeter.push(event)
    }
  }

  const labels: Record<PlanGroupKey, string> = {
    heute: 'Heute',
    morgen: 'Morgen',
    woche: 'Diese Woche',
    spaeter: 'Später',
    offen: 'Noch nicht terminiert',
  }

  return (Object.keys(groups) as PlanGroupKey[])
    .map((key) => ({ key, label: labels[key], events: groups[key] }))
    .filter((group) => group.events.length > 0)
}
