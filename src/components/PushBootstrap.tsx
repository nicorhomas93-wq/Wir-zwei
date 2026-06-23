import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { listenForForegroundMessages } from '../firebase/messaging'
import { usePushNotifications } from '../hooks/usePushNotifications'
import { useAppData } from '../storage/DataContext'

export default function ForegroundPushToast() {
  const [toast, setToast] = useState<{ title: string; body: string; url?: string } | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const cleanup = listenForForegroundMessages((message) => {
      setToast(message)
      window.setTimeout(() => setToast(null), 8000)
    })
    return cleanup ?? undefined
  }, [])

  if (!toast) return null

  return (
    <div className="foreground-push-toast animate-fade-in" role="status" aria-live="polite">
      <p className="foreground-push-toast-title">{toast.title}</p>
      <p className="foreground-push-toast-body">{toast.body}</p>
      <div className="foreground-push-toast-actions">
        {toast.url && (
          <button
            type="button"
            className="foreground-push-toast-link tap-active"
            onClick={() => {
              navigate(toast.url!)
              setToast(null)
            }}
          >
            Öffnen
          </button>
        )}
        <button
          type="button"
          className="foreground-push-toast-dismiss tap-active"
          onClick={() => setToast(null)}
        >
          OK
        </button>
      </div>
    </div>
  )
}

export function PushBootstrap() {
  const { user } = useAuth()
  const { notifications, pushDevices } = useAppData()
  const { enablePush } = usePushNotifications({ user })

  useEffect(() => {
    if (!user || !notifications.pushEnabled) return
    if (notifications.pushPermission !== 'granted') return

    const hasDevice = pushDevices.some(
      (device) => device.userId === user.id && device.token === notifications.pushSubscriptionToken
    )
    if (hasDevice && notifications.pushSubscriptionToken) return

    void enablePush()
  }, [
    user,
    notifications.pushEnabled,
    notifications.pushPermission,
    notifications.pushSubscriptionToken,
    pushDevices,
    enablePush,
  ])

  return null
}
