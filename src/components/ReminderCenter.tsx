import { Link } from 'react-router-dom'
import { useAppData } from '../storage/DataContext'
import { formatPlanEventSchedule } from '../utils/formatDate'
import { getUpcomingPlanHints } from '../utils/reminders'
import { toDateKey } from '../utils/calendar'

export default function ReminderCenter({ compact = false }: { compact?: boolean }) {
  const { events, notifications } = useAppData()
  const upcoming = getUpcomingPlanHints(events)
  const openCount = events.filter((event) => !event.done && !event.date).length

  if (upcoming.length === 0 && openCount === 0 && !notifications.dailyReminderEnabled) {
    return null
  }

  return (
    <section className={`reminder-center ${compact ? 'reminder-center--compact' : ''} card animate-fade-in`}>
      <div className="reminder-center-header">
        <div>
          <p className="reminder-center-kicker">Anstehend</p>
          <h2 className="title-calm text-base">Was steht an?</h2>
        </div>
        <Link to="/einstellungen" className="reminder-center-settings tap-active">
          Hinweise
        </Link>
      </div>

      {notifications.dailyReminderEnabled && (
        <p className="reminder-center-meta">
          Daily Reminder · {notifications.dailyReminderTime} Uhr
        </p>
      )}

      {upcoming.length > 0 ? (
        <ul className="reminder-center-list">
          {upcoming.map((event) => (
            <li key={event.id} className="reminder-center-item">
              <span className="reminder-center-item-title">{event.title}</span>
              <span className="reminder-center-item-when">{formatPlanEventSchedule(event)}</span>
              {event.source === 'generator' && (
                <span className="plan-source-badge reminder-center-badge">Zufallsdate</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="reminder-center-empty">Heute nichts Geplantes — vielleicht Zeit für Zufallsdate?</p>
      )}

      {openCount > 0 && (
        <p className="reminder-center-open">{openCount} offene Idee{openCount === 1 ? '' : 'n'} ohne Datum</p>
      )}

      <Link to="/planung" className="reminder-center-link tap-active">
        Zur Planung →
      </Link>
    </section>
  )
}

export function dailyOpenHint(notifications: { lastOpenedAt: string | null }): boolean {
  if (!notifications.lastOpenedAt) return true
  return toDateKey(new Date(notifications.lastOpenedAt)) !== toDateKey(new Date())
}
