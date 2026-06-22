import { WEEKDAYS, getCalendarDays, getMonthLabel, isTodayKey, toDateKey } from '../utils/calendar'

interface MonthCalendarProps {
  year: number
  month: number
  selectedDate: string
  eventDates: Set<string>
  onSelectDate: (dateKey: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

export default function MonthCalendar({
  year,
  month,
  selectedDate,
  eventDates,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: MonthCalendarProps) {
  const days = getCalendarDays(year, month)

  return (
    <div className="calendar card animate-fade-in">
      <div className="calendar-header">
        <button type="button" onClick={onPrevMonth} className="calendar-nav tap-active" aria-label="Vorheriger Monat">
          ‹
        </button>
        <h2 className="calendar-title">{getMonthLabel(year, month)}</h2>
        <button type="button" onClick={onNextMonth} className="calendar-nav tap-active" aria-label="Nächster Monat">
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map((day) => (
          <span key={day} className="calendar-weekday">
            {day}
          </span>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((date, index) => {
          if (!date) {
            return <span key={`empty-${index}`} className="calendar-day calendar-day--empty" aria-hidden />
          }

          const dateKey = toDateKey(date)
          const isSelected = selectedDate === dateKey
          const isToday = isTodayKey(dateKey)
          const hasEvents = eventDates.has(dateKey)

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(dateKey)}
              className={`calendar-day tap-active ${isSelected ? 'calendar-day--selected' : ''} ${isToday ? 'calendar-day--today' : ''}`}
              aria-label={date.toLocaleDateString('de-DE')}
              aria-pressed={isSelected}
            >
              <span>{date.getDate()}</span>
              {hasEvents && <span className="calendar-dot" aria-hidden />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
