import { useEffect, useState } from 'react'
import { RELATIONSHIP_START, RELATIONSHIP_START_LABEL } from '../constants/relationship'
import { computeDuration, type RelationshipDuration } from '../utils/relationshipCounter'

const UNITS: Array<{ key: keyof RelationshipDuration; label: string }> = [
  { key: 'years', label: 'Jahre' },
  { key: 'months', label: 'Monate' },
  { key: 'days', label: 'Tage' },
  { key: 'hours', label: 'Stunden' },
  { key: 'minutes', label: 'Minuten' },
  { key: 'seconds', label: 'Sekunden' },
]

export default function RelationshipCounter() {
  const [duration, setDuration] = useState(() =>
    computeDuration(RELATIONSHIP_START, new Date())
  )

  useEffect(() => {
    const tick = () => setDuration(computeDuration(RELATIONSHIP_START, new Date()))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section className="relationship-counter animate-fade-in" aria-live="polite">
      <p className="relationship-counter-kicker">Seit {RELATIONSHIP_START_LABEL}</p>

      <div className="relationship-counter-grid">
        {UNITS.map(({ key, label }) => (
          <div key={key} className="relationship-counter-unit">
            <span className="relationship-counter-value">{duration[key]}</span>
            <span className="relationship-counter-label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
