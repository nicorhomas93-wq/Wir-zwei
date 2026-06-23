const DAILY_REMINDER_MESSAGES = [
  'Schaut mal kurz bei Wir Zwei rein.',
  'Heute schon einmal in Wir Zwei gewesen?',
  'Vielleicht wartet etwas Kleines auf euch.',
  'Kurzer Blick in Wir Zwei?',
] as const

export interface NotificationPreferences {
  dailyReminderEnabled: boolean
  dailyReminderTime: string
  eventReminderEnabled: boolean
  pushEnabled: boolean
  pushPermission: string
  pushPlatform: string | null
  pushSubscriptionToken: string | null
  lastOpenedAt: string | null
  lastDailyReminderShownAt: string | null
  lastDailyPushSentAt: string | null
  dismissedInAppReminderIds: string[]
}

export interface PlanEvent {
  id: string
  title: string
  date?: string
  time?: string
  done: boolean
  reminderEnabled?: boolean
  reminderType?: 'day_of' | 'one_hour_before' | 'custom' | 'none'
  reminderTime?: string
  reminderShownAt?: string
  pushReminderSentKey?: string
}

export interface PushDevice {
  id: string
  userId: string
  token: string
  platform: string
  updatedAt: string
}

function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
  return DAILY_REMINDER_MESSAGES[index] ?? DAILY_REMINDER_MESSAGES[0]
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

function eventStartAt(event: PlanEvent): Date | null {
  if (!event.date) return null
  if (event.time) return parseTimeOnDate(event.date, event.time)
  return new Date(`${event.date}T09:00:00`)
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

export interface PushJob {
  tokens: string[]
  title: string
  body: string
  url: string
}

export interface PushJobResult {
  jobs: PushJob[]
  notificationsPatch: Partial<NotificationPreferences>
  eventsPatch: Array<{ id: string; pushReminderSentKey: string }>
  invalidTokens: string[]
}

export function collectPushJobs(
  prefs: NotificationPreferences,
  events: PlanEvent[],
  pushDevices: PushDevice[],
  now = new Date(),
  appOrigin = 'https://wir-zwei.vercel.app'
): PushJobResult {
  const tokens = [...new Set(pushDevices.map((device) => device.token).filter(Boolean))]
  const jobs: PushJob[] = []
  const eventsPatch: Array<{ id: string; pushReminderSentKey: string }> = []
  let notificationsPatch: Partial<NotificationPreferences> = {}

  if (tokens.length === 0) {
    return { jobs, notificationsPatch, eventsPatch, invalidTokens: [] }
  }

  if (shouldSendDailyPush(prefs, now)) {
    jobs.push({
      tokens,
      title: 'Wir Zwei',
      body: pickDailyReminderMessage(now.getTime()),
      url: `${appOrigin}/`,
    })
    notificationsPatch = {
      lastDailyPushSentAt: now.toISOString(),
    }
  }

  if (prefs.eventReminderEnabled) {
    for (const event of events) {
      if (!shouldSendEventPush(event, now)) continue
      const key = buildEventPushReminderKey(event, now)
      jobs.push({
        tokens,
        title: 'Planung · Wir Zwei',
        body: buildEventReminderMessage(event, now),
        url: `${appOrigin}/planung`,
      })
      eventsPatch.push({ id: event.id, pushReminderSentKey: key })
    }
  }

  return { jobs, notificationsPatch, eventsPatch, invalidTokens: [] }
}
