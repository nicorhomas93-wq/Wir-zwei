import { useEffect, useState } from 'react'
import type { EventReminderType, PlanEvent } from '../types'
import { updateEvent } from '../storage/db'

const REMINDER_OPTIONS: Array<{ id: EventReminderType; label: string }> = [
  { id: 'day_of', label: 'Am selben Tag' },
  { id: 'one_hour_before', label: '1 Stunde vorher' },
  { id: 'custom', label: 'Eigene Uhrzeit' },
  { id: 'none', label: 'Keine Erinnerung' },
]

interface PlanEventEditSheetProps {
  event: PlanEvent
  onClose: () => void
  onSaved?: () => void
}

export default function PlanEventEditSheet({ event, onClose, onSaved }: PlanEventEditSheetProps) {
  const [date, setDate] = useState(event.date ?? '')
  const [time, setTime] = useState(event.time ?? '')
  const [note, setNote] = useState(event.note ?? '')
  const [reminderEnabled, setReminderEnabled] = useState(event.reminderEnabled !== false)
  const [reminderType, setReminderType] = useState<EventReminderType>(event.reminderType ?? 'day_of')
  const [reminderTime, setReminderTime] = useState(event.reminderTime ?? '')

  useEffect(() => {
    setDate(event.date ?? '')
    setTime(event.time ?? '')
    setNote(event.note ?? '')
    setReminderEnabled(event.reminderEnabled !== false)
    setReminderType(event.reminderType ?? 'day_of')
    setReminderTime(event.reminderTime ?? '')
  }, [event])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    updateEvent(event.id, {
      date: date || undefined,
      time: time || undefined,
      note: note.trim() || undefined,
      reminderEnabled: reminderType === 'none' ? false : reminderEnabled,
      reminderType,
      reminderTime: reminderType === 'custom' ? reminderTime || undefined : undefined,
    })

    onSaved?.()
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="plan-edit-sheet card animate-fade-in space-y-4">
      <div className="plan-edit-sheet-header">
        <p className="plan-edit-sheet-kicker">Bearbeiten</p>
        <h3 className="plan-edit-sheet-title">{event.title}</h3>
      </div>

      <div className="plan-edit-grid">
        <label className="plan-edit-field">
          <span>Datum</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
          />
        </label>
        <label className="plan-edit-field">
          <span>Uhrzeit</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="input-field"
          />
        </label>
      </div>

      <label className="plan-edit-field">
        <span>Notiz</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional"
          className="input-field min-h-16 resize-none"
        />
      </label>

      <div className="plan-edit-reminder">
        <label className="memory-toggle tap-active">
          <input
            type="checkbox"
            checked={reminderEnabled && reminderType !== 'none'}
            onChange={(e) => setReminderEnabled(e.target.checked)}
          />
          <span>Erinnerung</span>
        </label>

        {reminderEnabled && (
          <div className="plan-edit-reminder-options">
            {REMINDER_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`plan-reminder-chip tap-active ${reminderType === option.id ? 'plan-reminder-chip--active' : ''}`}
                onClick={() => setReminderType(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {reminderEnabled && reminderType === 'custom' && (
          <label className="plan-edit-field mt-2">
            <span>Erinnerungszeit</span>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="input-field"
            />
          </label>
        )}
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">
          Abbrechen
        </button>
        <button type="submit" className="btn-primary flex-1">
          Speichern
        </button>
      </div>
    </form>
  )
}
