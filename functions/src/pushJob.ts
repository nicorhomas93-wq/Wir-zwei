import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import {
  collectPushJobs,
  type NotificationPreferences,
  type PlanEvent,
  type PushDevice,
} from './reminderLogic'

initializeApp()

const db = getFirestore()
const messaging = getMessaging()

const MAIN_DOC_PATH = ['coupleApp', 'wir-zwei'] as const
const APP_ORIGIN = process.env.APP_ORIGIN ?? 'https://wir-zwei.vercel.app'

function defaultNotifications(): NotificationPreferences {
  return {
    dailyReminderEnabled: true,
    dailyReminderTime: '19:00',
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
}

export async function runReminderPushJob(now = new Date()): Promise<void> {
  const docRef = db.doc(`${MAIN_DOC_PATH[0]}/${MAIN_DOC_PATH[1]}`)
  const snapshot = await docRef.get()
  if (!snapshot.exists) return

  const data = snapshot.data() ?? {}
  const notifications = {
    ...defaultNotifications(),
    ...(data.notifications as Partial<NotificationPreferences> | undefined),
  }
  const events = (data.events as PlanEvent[]) ?? []
  const pushDevices = (data.pushDevices as PushDevice[]) ?? []

  const { jobs, notificationsPatch, eventsPatch } = collectPushJobs(
    notifications,
    events,
    pushDevices,
    now,
    APP_ORIGIN
  )

  if (jobs.length === 0) return

  const invalidTokens = new Set<string>()

  for (const job of jobs) {
    const response = await messaging.sendEachForMulticast({
      tokens: job.tokens,
      notification: {
        title: job.title,
        body: job.body,
      },
      data: {
        url: job.url.replace(APP_ORIGIN, '') || '/',
      },
      webpush: {
        fcmOptions: {
          link: job.url,
        },
      },
    })

    response.responses.forEach((result, index) => {
      if (result.success) return
      const code = result.error?.code
      if (
        code === 'messaging/registration-token-not-registered' ||
        code === 'messaging/invalid-registration-token'
      ) {
        invalidTokens.add(job.tokens[index]!)
      }
    })
  }

  const updatePayload: Record<string, unknown> = {}

  if (Object.keys(notificationsPatch).length > 0) {
    updatePayload.notifications = {
      ...notifications,
      ...notificationsPatch,
    }
  }

  if (eventsPatch.length > 0) {
    const patchMap = new Map(eventsPatch.map((entry) => [entry.id, entry.pushReminderSentKey]))
    updatePayload.events = events.map((event) =>
      patchMap.has(event.id)
        ? { ...event, pushReminderSentKey: patchMap.get(event.id) }
        : event
    )
  }

  if (invalidTokens.size > 0) {
    updatePayload.pushDevices = pushDevices.filter((device) => !invalidTokens.has(device.token))
  }

  if (Object.keys(updatePayload).length > 0) {
    updatePayload.updatedAt = FieldValue.serverTimestamp()
    await docRef.update(updatePayload)
  }
}

export async function sendImmediateTestPush(): Promise<{
  sent: number
  tokens: number
  failures: number
}> {
  const docRef = db.doc(`${MAIN_DOC_PATH[0]}/${MAIN_DOC_PATH[1]}`)
  const snapshot = await docRef.get()
  if (!snapshot.exists) {
    return { sent: 0, tokens: 0, failures: 0 }
  }

  const data = snapshot.data() ?? {}
  const pushDevices = (data.pushDevices as PushDevice[]) ?? []
  const tokens = [...new Set(pushDevices.map((device) => device.token).filter(Boolean))]

  if (tokens.length === 0) {
    return { sent: 0, tokens: 0, failures: 0 }
  }

  const response = await messaging.sendEachForMulticast({
    tokens,
    notification: {
      title: 'Wir Zwei · Test',
      body: 'Push funktioniert! 💛',
    },
    data: {
      url: '/',
    },
    webpush: {
      fcmOptions: {
        link: `${APP_ORIGIN}/`,
      },
    },
  })

  const invalidTokens = new Set<string>()
  response.responses.forEach((result, index) => {
    if (result.success) return
    const code = result.error?.code
    if (
      code === 'messaging/registration-token-not-registered' ||
      code === 'messaging/invalid-registration-token'
    ) {
      invalidTokens.add(tokens[index]!)
    }
  })

  if (invalidTokens.size > 0) {
    await docRef.update({
      pushDevices: pushDevices.filter((device) => !invalidTokens.has(device.token)),
    })
  }

  return {
    sent: response.successCount,
    tokens: tokens.length,
    failures: response.failureCount,
  }
}
