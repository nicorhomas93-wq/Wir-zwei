import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAppData } from '../storage/DataContext'
import { dismissInAppReminder } from '../storage/db'
import { collectInAppReminders } from '../utils/reminders'
import { toDateKey } from '../utils/calendar'

interface InAppRemindersProps {
  isFirstOpenToday: boolean
}

export default function InAppReminders({ isFirstOpenToday }: InAppRemindersProps) {
  const { events, notifications } = useAppData()

  const reminders = useMemo(
    () => collectInAppReminders(events, notifications, new Date(), isFirstOpenToday),
    [events, notifications, isFirstOpenToday]
  )

  if (reminders.length === 0) return null

  const handleDismiss = (id: string) => {
    dismissInAppReminder(id)
  }

  return (
    <div className="in-app-reminders" aria-live="polite">
      {reminders.map((reminder) => (
        <div key={reminder.id} className={`in-app-reminder in-app-reminder--${reminder.kind} animate-fade-in`}>
          <p className="in-app-reminder-text">{reminder.message}</p>
          <div className="in-app-reminder-actions">
            {reminder.linkTo && (
              <Link to={reminder.linkTo} className="in-app-reminder-link tap-active">
                Ansehen
              </Link>
            )}
            <button
              type="button"
              className="in-app-reminder-dismiss tap-active"
              onClick={() => handleDismiss(reminder.id)}
            >
              OK
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export function wasFirstOpenToday(lastOpenedAt: string | null): boolean {
  if (!lastOpenedAt) return true
  return toDateKey(new Date(lastOpenedAt)) !== toDateKey(new Date())
}
