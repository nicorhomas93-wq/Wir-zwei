import { useEffect, useId, useState } from 'react'
import type { TimelineEntry } from '../utils/penaltyTimeline'
import { formatTimelineDelta, formatTimelineTime } from '../utils/penaltyTimeline'

interface PenaltyMiniTimelineProps {
  items: TimelineEntry[]
}

function TimelineRow({ item, fresh }: { item: TimelineEntry; fresh?: boolean }) {
  return (
    <li className={`penalty-mini-timeline-item ${fresh ? 'penalty-mini-timeline-item--fresh' : ''}`}>
      <span
        className={`penalty-mini-timeline-delta ${item.delta > 0 ? 'penalty-mini-timeline-delta--plus' : 'penalty-mini-timeline-delta--minus'}`}
      >
        {formatTimelineDelta(item.delta)}
      </span>
      <span className="penalty-mini-timeline-text">
        {item.label}
        <span className="penalty-mini-timeline-who"> → {item.targetUserName}</span>
      </span>
      <time className="penalty-mini-timeline-time">{formatTimelineTime(item.at)}</time>
    </li>
  )
}

export default function PenaltyMiniTimeline({ items }: PenaltyMiniTimelineProps) {
  const bodyId = useId()
  const [open, setOpen] = useState(false)
  const latest = items[0]

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)')
    const sync = () => setOpen(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  if (items.length === 0) return null

  return (
    <section className="penalty-mini-timeline-panel document-block animate-fade-in">
      <button
        type="button"
        className="penalty-mini-timeline-toggle tap-active"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={bodyId}
      >
        <div className="penalty-mini-timeline-toggle-main">
          <p className="penalty-mini-timeline-toggle-label">Verlauf</p>
          {!open && latest && (
            <p className="penalty-mini-timeline-preview">
              <span
                className={`penalty-mini-timeline-preview-delta ${latest.delta > 0 ? 'penalty-mini-timeline-delta--plus' : 'penalty-mini-timeline-delta--minus'}`}
              >
                {formatTimelineDelta(latest.delta)}
              </span>
              {latest.label}
              <span className="penalty-mini-timeline-who"> → {latest.targetUserName}</span>
            </p>
          )}
          {open && (
            <p className="penalty-mini-timeline-toggle-meta">
              {items.length} {items.length === 1 ? 'Eintrag' : 'Einträge'}
            </p>
          )}
        </div>
        <span
          className={`penalty-mini-timeline-chevron ${open ? 'penalty-mini-timeline-chevron--open' : ''}`}
          aria-hidden
        >
          ›
        </span>
      </button>

      <div
        id={bodyId}
        className={`penalty-mini-timeline-body ${open ? 'penalty-mini-timeline-body--open' : ''}`}
      >
        <div className="penalty-mini-timeline-body-inner">
          <ul className="penalty-mini-timeline-list">
            {items.map((item, index) => (
              <TimelineRow key={item.id} item={item} fresh={open && index === 0} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
