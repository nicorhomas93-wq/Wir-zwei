import type { NotificationPreferences } from '../types'

export const DEFAULT_DAILY_REMINDER_TIME = '19:00'

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  dailyReminderEnabled: true,
  dailyReminderTime: DEFAULT_DAILY_REMINDER_TIME,
  eventReminderEnabled: true,
  pushEnabled: false,
  pushPermission: 'default',
  pushPlatform: null,
  pushSubscriptionToken: null,
  lastOpenedAt: null,
  lastDailyReminderShownAt: null,
  lastDailyPushSentAt: null,
  dismissedInAppReminderIds: [],
}

export const DAILY_REMINDER_MESSAGES = [
  'Schaut mal kurz bei Wir Zwei rein.',
  'Heute schon einmal in Wir Zwei gewesen?',
  'Vielleicht wartet etwas Kleines auf euch.',
  'Kurzer Blick in Wir Zwei?',
] as const
