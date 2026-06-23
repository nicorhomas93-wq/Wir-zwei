import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DEFAULT_DAILY_REMINDER_TIME } from '../constants/notifications'
import { useAuth } from '../auth/AuthContext'
import { usePushNotifications } from '../hooks/usePushNotifications'
import { useAppData } from '../storage/DataContext'
import { updateNotificationPreferences } from '../storage/db'
import { isStandaloneApp } from '../utils/pwa'
import PageHeader from '../components/PageHeader'
import { SYMBOLS } from '../constants/symbols'

export default function NotificationSettings() {
  const { user } = useAuth()
  const { notifications, pushDevices } = useAppData()
  const { supported, busy, error, enablePush, disablePush } = usePushNotifications({ user })
  const [localError, setLocalError] = useState<string | null>(null)
  const standalone = isStandaloneApp()

  const myDeviceActive = useMemo(
    () =>
      Boolean(
        user &&
          pushDevices.some(
            (device) =>
              device.userId === user.id &&
              device.token === notifications.pushSubscriptionToken &&
              notifications.pushPermission === 'granted'
          )
      ),
    [user, pushDevices, notifications.pushSubscriptionToken, notifications.pushPermission]
  )

  const handlePushToggle = useCallback(
    async (enabled: boolean) => {
      setLocalError(null)

      if (!supported) {
        setLocalError('Push wird auf diesem Gerät oder Browser nicht unterstützt.')
        return
      }

      if (!standalone && /iphone|ipad|ipod/i.test(navigator.userAgent)) {
        setLocalError('Auf iOS zuerst „Zum Home-Bildschirm“ hinzufügen, dann Push aktivieren.')
        return
      }

      if (enabled) {
        updateNotificationPreferences({ pushEnabled: true })
        const ok = await enablePush()
        if (!ok) {
          updateNotificationPreferences({ pushEnabled: false })
        }
        return
      }

      disablePush()
      updateNotificationPreferences({ pushEnabled: false, pushPermission: Notification.permission })
    },
    [supported, standalone, enablePush, disablePush]
  )

  const permissionLabel =
    notifications.pushPermission === 'granted'
      ? 'Erlaubt'
      : notifications.pushPermission === 'denied'
        ? 'Blockiert'
        : 'Noch nicht gefragt'

  return (
    <div className="space-y-6 pb-16">
      <div>
        <Link to="/planung" className="text-sm nav-back tap-active">
          ← Planung
        </Link>
        <PageHeader
          symbol={SYMBOLS.memories}
          title="Hinweise & Erinnerungen"
          subtitle="Sanft erinnern — auch wenn die App zu ist"
        />
      </div>

      <section className="card space-y-4 animate-fade-in">
        <h2 className="title-calm text-base">Daily Reminder</h2>
        <p className="text-sm card-note">
          Einmal täglich daran erinnern, kurz in Wir Zwei reinzuschauen — nur wenn ihr heute noch nicht
          geöffnet habt.
        </p>

        <label className="memory-toggle tap-active">
          <input
            type="checkbox"
            checked={notifications.dailyReminderEnabled}
            onChange={(e) => updateNotificationPreferences({ dailyReminderEnabled: e.target.checked })}
          />
          <span>Daily Reminder aktivieren</span>
        </label>

        <label className="plan-edit-field">
          <span>Uhrzeit</span>
          <input
            type="time"
            value={notifications.dailyReminderTime}
            onChange={(e) =>
              updateNotificationPreferences({ dailyReminderTime: e.target.value || DEFAULT_DAILY_REMINDER_TIME })
            }
            className="input-field"
            disabled={!notifications.dailyReminderEnabled}
          />
        </label>
      </section>

      <section className="card space-y-4 animate-fade-in">
        <h2 className="title-calm text-base">Geplante Aktivitäten</h2>
        <label className="memory-toggle tap-active">
          <input
            type="checkbox"
            checked={notifications.eventReminderEnabled}
            onChange={(e) => updateNotificationPreferences({ eventReminderEnabled: e.target.checked })}
          />
          <span>Erinnerungen für Planung</span>
        </label>
        <p className="text-sm card-note">
          Hinweise zu heutigen oder bald anstehenden Aktivitäten — in der App und per Push (wenn aktiviert).
        </p>
      </section>

      <section className="card space-y-4 animate-fade-in notification-push-ready">
        <h2 className="title-calm text-base">Push-Benachrichtigungen</h2>
        <p className="text-sm card-note">
          Echte System-Benachrichtigungen für Daily Reminder und geplante Aktivitäten — auch wenn Wir Zwei
          geschlossen ist.
        </p>

        <label className="memory-toggle tap-active">
          <input
            type="checkbox"
            checked={myDeviceActive || notifications.pushEnabled}
            disabled={busy || !supported}
            onChange={(e) => void handlePushToggle(e.target.checked)}
          />
          <span>Push auf diesem Gerät aktivieren</span>
        </label>

        {(error || localError) && <p className="text-sm text-rose-300/90">{error ?? localError}</p>}

        <div className="notification-push-meta text-xs card-note space-y-1">
          <p>Gerät: {myDeviceActive ? 'Aktiv' : 'Inaktiv'}</p>
          <p>Berechtigung: {permissionLabel}</p>
          <p>Plattform: {notifications.pushPlatform ?? '—'}</p>
          <p>Registrierte Geräte: {pushDevices.length}</p>
        </div>

        {notifications.pushPermission === 'denied' && (
          <p className="text-sm card-note">
            Push ist blockiert. In den Browser- oder Geräteeinstellungen für Wir Zwei Benachrichtigungen
            erlauben.
          </p>
        )}
      </section>

      {!standalone && (
        <section className="card animate-fade-in space-y-2">
          <p className="text-sm card-note leading-relaxed">
            Für zuverlässige Push-Hinweise: Wir Zwei zum Home-Bildschirm hinzufügen (Android & iOS).
          </p>
          <p className="text-xs card-note">
            iOS: Safari → Teilen → „Zum Home-Bildschirm“. Push funktioniert ab iOS 16.4 nur in der
            installierten App.
          </p>
        </section>
      )}
    </div>
  )
}
