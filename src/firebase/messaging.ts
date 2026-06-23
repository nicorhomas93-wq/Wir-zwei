import { getApp } from 'firebase/app'
import { getMessaging, getToken, isSupported, onMessage, type Messaging } from 'firebase/messaging'
import { isFirebaseConfigured } from './config'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

let messagingInstance: Messaging | null = null

export async function isPushSupported(): Promise<boolean> {
  if (!isFirebaseConfigured) return false
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return false
  try {
    return await isSupported()
  } catch {
    return false
  }
}

async function getMessagingInstance(): Promise<Messaging | null> {
  if (!(await isPushSupported())) return null
  if (!messagingInstance) {
    messagingInstance = getMessaging(getApp())
  }
  return messagingInstance
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  return Notification.requestPermission()
}

export async function fetchFcmToken(): Promise<string | null> {
  if (!VAPID_KEY) {
    console.warn('[Wir Zwei] VITE_FIREBASE_VAPID_KEY fehlt — Push deaktiviert.')
    return null
  }

  const messaging = await getMessagingInstance()
  if (!messaging) return null

  const registration = await navigator.serviceWorker.ready

  try {
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    })
    return token || null
  } catch (error) {
    console.warn('[Wir Zwei] FCM Token konnte nicht geholt werden.', error)
    return null
  }
}

export function listenForForegroundMessages(
  handler: (payload: { title: string; body: string; url?: string }) => void
): (() => void) | null {
  if (!isFirebaseConfigured) return null

  void getMessagingInstance().then((messaging) => {
    if (!messaging) return
    onMessage(messaging, (payload) => {
      handler({
        title: payload.notification?.title ?? 'Wir Zwei',
        body: payload.notification?.body ?? '',
        url: payload.data?.url,
      })
    })
  })

  return () => {
    messagingInstance = null
  }
}
