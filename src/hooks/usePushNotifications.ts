import { useCallback, useEffect, useState } from 'react'
import type { User } from '../types'
import {
  fetchFcmToken,
  isPushSupported,
  listenForForegroundMessages,
  requestPushPermission,
} from '../firebase/messaging'
import { useAppData } from '../storage/DataContext'
import { registerPushDevice, unregisterPushDevice, updateNotificationPreferences } from '../storage/db'
import { detectPushPlatform } from '../utils/pwa'

interface UsePushNotificationsOptions {
  user: User | null
  onForegroundMessage?: (message: { title: string; body: string; url?: string }) => void
}

export function usePushNotifications({ user, onForegroundMessage }: UsePushNotificationsOptions) {
  const { notifications } = useAppData()
  const [supported, setSupported] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void isPushSupported().then(setSupported)
  }, [])

  useEffect(() => {
    if (!onForegroundMessage) return undefined
    return listenForForegroundMessages(onForegroundMessage) ?? undefined
  }, [onForegroundMessage])

  const enablePush = useCallback(async () => {
    if (!user) return false
    setBusy(true)
    setError(null)

    try {
      const permission = await requestPushPermission()
      updateNotificationPreferences({ pushPermission: permission })

      if (permission !== 'granted') {
        setError('Benachrichtigungen wurden nicht erlaubt.')
        updateNotificationPreferences({ pushEnabled: false })
        return false
      }

      const token = await fetchFcmToken()
      if (!token) {
        setError('Push-Token konnte nicht erstellt werden. Bitte App neu installieren und erneut versuchen.')
        return false
      }

      const platform = detectPushPlatform() ?? 'web'
      registerPushDevice({
        userId: user.id,
        token,
        platform,
      })

      updateNotificationPreferences({
        pushEnabled: true,
        pushPermission: 'granted',
        pushPlatform: platform,
        pushSubscriptionToken: token,
      })

      return true
    } catch (err) {
      console.warn('[Wir Zwei] Push aktivieren fehlgeschlagen.', err)
      setError('Push konnte nicht aktiviert werden.')
      return false
    } finally {
      setBusy(false)
    }
  }, [user])

  const disablePush = useCallback(() => {
    if (notifications.pushSubscriptionToken) {
      unregisterPushDevice(notifications.pushSubscriptionToken)
    }
    updateNotificationPreferences({
      pushEnabled: false,
      pushSubscriptionToken: null,
    })
  }, [notifications.pushSubscriptionToken])

  return {
    supported,
    busy,
    error,
    enablePush,
    disablePush,
  }
}
