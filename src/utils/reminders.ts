import { DAILY_REMINDER_MESSAGES } from '../constants/notifications'
import type { NotificationPreferences, PlanEvent } from '../types'
import { toDateKey } from './calendar'

export type InAppReminderKind = 'daily' | 'event'

export interface InAppReminder {
  id: string
  kind: InAppReminderKind
  message: string
  eventId?: string
  linkTo?: string
}

function sameDay(isoOrKey: string, date = new Date()): boolean {
  const key = isoOrKey.includes('T') ? toDateKey(new Date(isoOrKey)) : isoOrKey.slice(0, 10)
  return key === toDateKey(date)
}

function parseTimeOnDate(dateKey: string, time: string): Date {
  return new Date(`${dateKey}T${time}:00`)
}

function isFirstOpenToday(prefs: NotificationPreferences, now: Date): boolean {
  if (!prefs.lastOpenedAt) return true
  return !sameDay(prefs.lastOpenedAt, now)
}

function isAfterDailyTime(prefs: NotificationPreferences, now: Date): boolean {
  const [hours, minutes] = prefs.dailyReminderTime.split(':').map(Number)
  const trigger = new Date(now)
  trigger.setHours(hours, minutes, 0, 0)
  return now >= trigger
}

export function pickDailyReminderMessage(seed = Date.now()): string {
  const index = Math.abs(seed) % DAILY_REMINDER_MESSAGES.length
  return DAILY_REMINDER_MESSAGES[index]
}

export function shouldShowDailyReminder(
  prefs: NotificationPreferences,
  now = new Date(),
  isFirstOpenTodayFlag = isFirstOpenToday(prefs, now)
): boolean {
  if (!prefs.dailyReminderEnabled) return false
  if (!isFirstOpenTodayFlag) return false
  if (prefs.lastDailyReminderShownAt && sameDay(prefs.lastDailyReminderShownAt, now)) return false
  return isAfterDailyTime(prefs, now)
}

function eventStartAt(event: PlanEvent): Date | null {
  if (!event.date) return null
  if (event.time) return parseTimeOnDate(event.date, event.time)
  const start = new Date(`${event.date}T09:00:00`)
  return start
}

function wasReminderShownToday(event: PlanEvent): boolean {
  return Boolean(event.reminderShownAt && sameDay(event.reminderShownAt))
}

export function shouldShowEventReminder(event: PlanEvent, now = new Date()): boolean {
  if (event.done) return false
  if (event.reminderEnabled === false) return false
  if (!event.date) return false
  if (wasReminderShownToday(event)) return false

  const type = event.reminderType ?? 'day_of'
  if (type === 'none') return false

  const today = toDateKey(now)

  if (type === 'day_of') {
    return event.date === today
  }

  const start = eventStartAt(event)
  if (!start) return false

  if (type === 'one_hour_before') {
    if (!event.time) return event.date === today
    const diffMs = start.getTime() - now.getTime()
    return diffMs > 0 && diffMs <= 60 * 60 * 1000
  }

  if (type === 'custom') {
    if (!event.reminderTime) return event.date === today
    const customAt = parseTimeOnDate(event.date, event.reminderTime)
    return now >= customAt && now.getTime() - customAt.getTime() <= 3 * 60 * 60 * 1000
  }

  return false
}

export function shouldSendDailyPush(
  prefs: NotificationPreferences,
  now = new Date(),
  isFirstOpenTodayFlag = isFirstOpenToday(prefs, now)
): boolean {
  if (!prefs.dailyReminderEnabled) return false
  if (!isFirstOpenTodayFlag) return false
  if (prefs.lastDailyPushSentAt && sameDay(prefs.lastDailyPushSentAt, now)) return false
  return isAfterDailyTime(prefs, now)
}

export function buildEventPushReminderKey(event: PlanEvent, now = new Date()): string {
  const type = event.reminderType ?? 'day_of'
  return `event:${event.id}:${toDateKey(now)}:${type}`
}

export function shouldSendEventPush(event: PlanEvent, now = new Date()): boolean {
  if (!shouldShowEventReminder(event, now)) return false
  const key = buildEventPushReminderKey(event, now)
  return event.pushReminderSentKey !== key
}

export function buildEventReminderMessage(event: PlanEvent, now = new Date()): string {
  const type = event.reminderType ?? 'day_of'
  if (type === 'one_hour_before') {
    return `In 1 Stunde: ${event.title}`
  }
  if (event.date === toDateKey(now)) {
    if (event.time) return `Später heute: ${event.title} · ${event.time}`
    return `Heute geplant: ${event.title}`
  }
  return `Bald geplant: ${event.title}`
}

export function collectInAppReminders(
  events: PlanEvent[],
  prefs: NotificationPreferences,
  now = new Date(),
  isFirstOpenTodayFlag = isFirstOpenToday(prefs, now)
): InAppReminder[] {
  const dismissed = new Set(prefs.dismissedInAppReminderIds)
  const reminders: InAppReminder[] = []

  if (shouldShowDailyReminder(prefs, now, isFirstOpenTodayFlag)) {
    reminders.push({
      id: `daily-${toDateKey(now)}`,
      kind: 'daily',
      message: pickDailyReminderMessage(now.getTime()),
      linkTo: '/',
    })
  }

  if (prefs.eventReminderEnabled) {
    for (const event of events) {
      if (!shouldShowEventReminder(event, now)) continue
      reminders.push({
        id: `event:${event.id}:${toDateKey(now)}`,
        kind: 'event',
        message: buildEventReminderMessage(event, now),
        eventId: event.id,
        linkTo: '/planung',
      })
    }
  }

  return reminders.filter((entry) => !dismissed.has(entry.id)).slice(0, 3)
}

export function getUpcomingPlanHints(events: PlanEvent[], now = new Date()): PlanEvent[] {
  const today = toDateKey(now)
  return events
    .filter((event) => !event.done && event.date && event.date >= today)
    .sort((a, b) => {
      const dateCmp = a.date!.localeCompare(b.date!)
      if (dateCmp !== 0) return dateCmp
      return (a.time ?? '').localeCompare(b.time ?? '')
    })
    .slice(0, 6)
}
