import { DEFAULT_NOTIFICATION_PREFERENCES } from '../constants/notifications'
import type { NotificationPreferences } from '../types'
import { detectPushPlatform } from '../utils/pwa'

function pickLatest(a: string | null, b: string | null): string | null {
  if (!a) return b
  if (!b) return a
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b
}

export function normalizeNotifications(raw?: Partial<NotificationPreferences>): NotificationPreferences {
  const platform = raw?.pushPlatform ?? detectPushPlatform()

  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...raw,
    dailyReminderTime: raw?.dailyReminderTime ?? DEFAULT_NOTIFICATION_PREFERENCES.dailyReminderTime,
    pushPlatform: platform,
    dismissedInAppReminderIds: [...new Set(raw?.dismissedInAppReminderIds ?? [])].slice(-40),
  }
}

export function mergeNotifications(
  remote: NotificationPreferences,
  local: NotificationPreferences
): NotificationPreferences {
  const merged = normalizeNotifications({
    ...remote,
    ...local,
    lastOpenedAt: pickLatest(remote.lastOpenedAt, local.lastOpenedAt),
    lastDailyReminderShownAt: pickLatest(remote.lastDailyReminderShownAt, local.lastDailyReminderShownAt),
    lastDailyPushSentAt: pickLatest(remote.lastDailyPushSentAt, local.lastDailyPushSentAt),
    dismissedInAppReminderIds: [
      ...new Set([
        ...(remote.dismissedInAppReminderIds ?? []),
        ...(local.dismissedInAppReminderIds ?? []),
      ]),
    ].slice(-40),
  })

  return merged
}
