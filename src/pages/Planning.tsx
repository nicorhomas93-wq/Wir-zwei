import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import AddButton from '../components/AddButton'
import DeleteButton from '../components/DeleteButton'
import EmptyState from '../components/EmptyState'
import MonthCalendar from '../components/MonthCalendar'
import PageHeader from '../components/PageHeader'
import { SYMBOLS } from '../constants/symbols'
import { useSectionVisit } from '../hooks/useSectionVisit'
import { useAppData } from '../storage/DataContext'
import { addEvent, addMemory, deleteEvent, toggleEventDone } from '../storage/db'
import { toDateKey } from '../utils/calendar'
import { formatEventDate, isToday } from '../utils/formatDate'

export default function Planning() {
  const { user } = useAuth()
  const { events } = useAppData()
  useSectionVisit('planung')
  const [searchParams, setSearchParams] = useSearchParams()
  const today = toDateKey(new Date())
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(today)
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [saveAsMemory, setSaveAsMemory] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.date.localeCompare(b.date)),
    [events]
  )

  const eventDates = useMemo(
    () => new Set(sortedEvents.map((event) => event.date)),
    [sortedEvents]
  )

  const selectedEvents = useMemo(
    () => sortedEvents.filter((event) => event.date === selectedDate),
    [sortedEvents, selectedDate]
  )

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowForm(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleSelectDate = (dateKey: string) => {
    setSelectedDate(dateKey)
    setViewDate(parseDateFromKey(dateKey))
  }

  const handleOpenForm = () => {
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !title.trim() || !selectedDate) return

    addEvent({
      userId: user.id,
      userName: user.name,
      title: title.trim(),
      date: selectedDate,
      note: note.trim() || undefined,
    })

    if (saveAsMemory) {
      const memoryText = note.trim()
        ? `${title.trim()}\n${note.trim()}`
        : title.trim()
      addMemory({
        userId: user.id,
        userName: user.name,
        text: memoryText,
      })
    }

    setTitle('')
    setNote('')
    setSaveAsMemory(false)
    setShowForm(false)
  }

  const handleToggleDone = (id: string) => {
    toggleEventDone(id)
  }

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        symbol={SYMBOLS.planning}
        title="Planung"
        subtitle="Gemeinsame Momente voraus"
      />

      <MonthCalendar
        year={year}
        month={month}
        selectedDate={selectedDate}
        eventDates={eventDates}
        onSelectDate={handleSelectDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="title-calm">{formatEventDate(selectedDate)}</h2>
          {isToday(selectedDate) && <span className="event-today-badge">Heute</span>}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card space-y-4 animate-fade-in">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titel"
              className="input-field"
              required
              autoFocus
            />

            <div className="input-field calendar-date-display">{formatEventDate(selectedDate)}</div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Notiz (optional)"
              className="input-field min-h-20 resize-none"
            />

            <label className="memory-toggle tap-active">
              <input
                type="checkbox"
                checked={saveAsMemory}
                onChange={(e) => setSaveAsMemory(e.target.checked)}
              />
              <span>Als Erinnerung speichern</span>
            </label>

            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                Abbrechen
              </button>
              <button type="submit" className="btn-primary flex-1">
                Speichern
              </button>
            </div>
          </form>
        )}

        {selectedEvents.length === 0 && !showForm ? (
          <EmptyState
            message={'Noch nichts geplant…\nWann ist eure nächste gemeinsame Zeit? ❤️'}
          />
        ) : (
          <ul className="space-y-3">
            {selectedEvents.map((event) => (
              <li
                key={event.id}
                className={`card animate-fade-in ${event.done ? 'event-card--done' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className={`title-calm ${event.done ? 'line-through opacity-50' : ''}`}>
                      {event.title}
                    </h3>
                    {event.note && <p className="text-sm card-note mt-2">{event.note}</p>}
                  </div>

                  <div className="card-actions">
                    <button
                      type="button"
                      onClick={() => handleToggleDone(event.id)}
                      className={`event-done-btn tap-active ${event.done ? 'event-done-btn--active' : ''}`}
                      aria-label={event.done ? 'Als offen markieren' : 'Als erledigt markieren'}
                    >
                      {event.done ? '✓' : '○'}
                    </button>
                    <DeleteButton
                      onConfirm={() => deleteEvent(event.id)}
                      confirmMessage="Termin wirklich löschen?"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!showForm && (
        <AddButton label="Termin erstellen" onClick={handleOpenForm} />
      )}
    </div>
  )
}

function parseDateFromKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}
