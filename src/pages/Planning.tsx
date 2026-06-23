import { useEffect, useMemo, useState } from 'react'

import { Link, useSearchParams } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext'

import AddButton from '../components/AddButton'

import DeleteButton from '../components/DeleteButton'

import EmptyState from '../components/EmptyState'

import MonthCalendar from '../components/MonthCalendar'

import PageHeader from '../components/PageHeader'

import PlanEventEditSheet from '../components/PlanEventEditSheet'

import ReminderCenter from '../components/ReminderCenter'

import { SYMBOLS } from '../constants/symbols'

import { useSectionVisit } from '../hooks/useSectionVisit'

import { useAppData } from '../storage/DataContext'

import { addEvent, addMemory, deleteEvent, toggleEventDone } from '../storage/db'

import type { PlanEvent } from '../types'

import { toDateKey } from '../utils/calendar'

import { formatEventDate, formatPlanEventSchedule, isToday } from '../utils/formatDate'

import { groupPlanEvents } from '../utils/planGroups'

import { hasPlanDate } from '../utils/planEvents'



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

  const [editingEvent, setEditingEvent] = useState<PlanEvent | null>(null)



  const year = viewDate.getFullYear()

  const month = viewDate.getMonth()



  const groupedEvents = useMemo(() => groupPlanEvents(events), [events])



  const eventDates = useMemo(

    () => new Set(events.filter(hasPlanDate).map((event) => event.date!)),

    [events]

  )



  const selectedEvents = useMemo(

    () => events.filter((event) => event.date === selectedDate),

    [events, selectedDate]

  )



  useEffect(() => {

    if (searchParams.get('new') === '1') {

      setShowForm(true)

      setSearchParams({}, { replace: true })

    }

  }, [searchParams, setSearchParams])



  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault()

    if (!user || !title.trim() || !selectedDate) return



    addEvent({

      userId: user.id,

      userName: user.name,

      title: title.trim(),

      date: selectedDate,

      note: note.trim() || undefined,

      source: 'manual',

      reminderEnabled: true,

      reminderType: 'day_of',

    })



    if (saveAsMemory) {

      const memoryText = note.trim() ? `${title.trim()}\n${note.trim()}` : title.trim()

      addMemory({ userId: user.id, userName: user.name, text: memoryText })

    }



    setTitle('')

    setNote('')

    setSaveAsMemory(false)

    setShowForm(false)

  }



  return (

    <div className="space-y-6 pb-16">

      <PageHeader symbol={SYMBOLS.planning} title="Planung" subtitle="Gemeinsame Momente voraus" />



      <ReminderCenter compact />



      <MonthCalendar

        year={year}

        month={month}

        selectedDate={selectedDate}

        eventDates={eventDates}

        onSelectDate={(dateKey) => {

          setSelectedDate(dateKey)

          setViewDate(parseDateFromKey(dateKey))

        }}

        onPrevMonth={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}

        onNextMonth={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}

      />



      {groupedEvents.length > 0 && (

        <section className="space-y-4">

          <div className="flex items-center justify-between gap-3">

            <h2 className="title-calm">Geplant</h2>

            <Link to="/einstellungen" className="reminder-center-settings tap-active">

              Hinweise

            </Link>

          </div>



          {groupedEvents.map((group) => (

            <div key={group.key} className="plan-group">

              <p className="plan-group-label">{group.label}</p>

              <ul className="space-y-2.5">

                {group.events.map((event) => (

                  <PlanEventCard

                    key={event.id}

                    event={event}

                    onToggleDone={() => toggleEventDone(event.id)}

                    onEdit={() => setEditingEvent(event)}

                    onSelectDate={event.date ? () => setSelectedDate(event.date!) : undefined}

                  />

                ))}

              </ul>

            </div>

          ))}

        </section>

      )}



      {editingEvent && (

        <PlanEventEditSheet

          event={editingEvent}

          onClose={() => setEditingEvent(null)}

          onSaved={() => setEditingEvent(null)}

        />

      )}



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



        {selectedEvents.length === 0 && !showForm && events.length === 0 ? (

          <EmptyState message={'Noch nichts geplant…\nWann ist eure nächste gemeinsame Zeit? ❤️'} />

        ) : selectedEvents.length === 0 && !showForm ? (

          <EmptyState message={'An diesem Tag noch nichts geplant.'} />

        ) : (

          <ul className="space-y-3">

            {selectedEvents.map((event) => (

              <PlanEventCard

                key={`day-${event.id}`}

                event={event}

                onToggleDone={() => toggleEventDone(event.id)}

                onEdit={() => setEditingEvent(event)}

                compact={false}

              />

            ))}

          </ul>

        )}

      </div>



      {!showForm && <AddButton label="Termin erstellen" onClick={() => setShowForm(true)} />}

    </div>

  )

}



function PlanEventCard({

  event,

  onToggleDone,

  onEdit,

  onSelectDate,

  compact = true,

}: {

  event: PlanEvent

  onToggleDone: () => void

  onEdit: () => void

  onSelectDate?: () => void

  compact?: boolean

}) {

  const schedule = formatPlanEventSchedule(event)

  const isOpen = !event.date

  const hasReminder = event.reminderEnabled !== false && event.reminderType !== 'none'



  return (

    <li

      className={`card animate-fade-in plan-event-card ${event.done ? 'event-card--done' : ''} ${compact ? 'plan-event-card--compact' : ''}`}

    >

      <div className="flex items-start justify-between gap-3">

        <button

          type="button"

          className={`min-w-0 flex-1 text-left ${onSelectDate ? 'tap-active' : ''}`}

          onClick={onSelectDate}

          disabled={!onSelectDate}

        >

          <div className="flex flex-wrap items-center gap-2 mb-1.5">

            {event.source === 'generator' && <span className="plan-source-badge">Aus Zufallsdate</span>}

            {isOpen && <span className="plan-open-badge">Offen</span>}

            {hasReminder && <span className="plan-reminder-badge">Erinnerung</span>}

          </div>

          <h3 className={`title-calm ${event.done ? 'line-through opacity-50' : ''}`}>{event.title}</h3>

          <p className={`text-sm mt-1.5 ${isOpen ? 'plan-schedule--open' : 'card-note'}`}>{schedule}</p>

          {event.note && !compact && <p className="text-sm card-note mt-2">{event.note}</p>}

        </button>



        <div className="card-actions">

          <button type="button" onClick={onEdit} className="plan-edit-btn tap-active" aria-label="Bearbeiten">

            ✎

          </button>

          <button

            type="button"

            onClick={onToggleDone}

            className={`event-done-btn tap-active ${event.done ? 'event-done-btn--active' : ''}`}

            aria-label={event.done ? 'Als offen markieren' : 'Als erledigt markieren'}

          >

            {event.done ? '✓' : '○'}

          </button>

          <DeleteButton onConfirm={() => deleteEvent(event.id)} confirmMessage="Termin wirklich löschen?" />

        </div>

      </div>

    </li>

  )

}



function parseDateFromKey(key: string): Date {

  const [year, month, day] = key.split('-').map(Number)

  return new Date(year, month - 1, day)

}


