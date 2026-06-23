import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ACTIVITY_CATEGORIES,
  type ActivityFilter,
  type RandomActivityResult,
  pickRandomActivity,
} from '../content/zufallsdate'

const ROLL_MS = 420
const COOLDOWN_MS = 2000

const FILTERS: Array<{ id: ActivityFilter; label: string }> = [
  { id: 'all', label: 'Alle mischen' },
  { id: 'alltag', label: ACTIVITY_CATEGORIES.alltag.label },
  { id: 'dates', label: ACTIVITY_CATEGORIES.dates.label },
  { id: 'liebe', label: ACTIVITY_CATEGORIES.liebe.label },
]

export default function Zufallsdate() {
  const [filter, setFilter] = useState<ActivityFilter>('all')
  const [result, setResult] = useState<RandomActivityResult | null>(null)
  const [rolling, setRolling] = useState(false)
  const [reveal, setReveal] = useState(false)
  const [cooldownLeft, setCooldownLeft] = useState(0)
  const cooldownUntil = useRef(0)
  const rollTimer = useRef<number | null>(null)

  useEffect(() => {
    if (cooldownLeft <= 0) return

    const tick = window.setInterval(() => {
      const remaining = Math.max(0, cooldownUntil.current - Date.now())
      setCooldownLeft(remaining)
    }, 120)

    return () => window.clearInterval(tick)
  }, [cooldownLeft])

  useEffect(() => {
    return () => {
      if (rollTimer.current) window.clearTimeout(rollTimer.current)
    }
  }, [])

  const startCooldown = useCallback(() => {
    cooldownUntil.current = Date.now() + COOLDOWN_MS
    setCooldownLeft(COOLDOWN_MS)
  }, [])

  const roll = useCallback(() => {
    if (rolling || cooldownLeft > 0) return

    setRolling(true)
    setReveal(false)
    startCooldown()

    if (rollTimer.current) window.clearTimeout(rollTimer.current)

    rollTimer.current = window.setTimeout(() => {
      const next = pickRandomActivity(filter, result)
      setResult(next)
      setRolling(false)
      setReveal(true)
    }, ROLL_MS)
  }, [cooldownLeft, filter, result, rolling, startCooldown])

  const categoryMeta = result ? ACTIVITY_CATEGORIES[result.category] : null
  const onCooldown = cooldownLeft > 0

  return (
    <div className="document-page zufallsdate-page space-y-5 pb-16">
      <div className="zufallsdate-header">
        <Link to="/" className="text-sm nav-back tap-active">
          ← Home
        </Link>
        <p className="document-kicker mt-3">Zufallsdate</p>
        <h1 className="document-title text-xl">Heute machen wir…</h1>
        <p className="document-subtitle">Eine spontane Idee – ohne lange überlegen.</p>
      </div>

      <section className="zufallsdate-stage document-block animate-fade-in">
        <div className="zufallsdate-filters">
          {FILTERS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={`zufallsdate-filter tap-active ${filter === entry.id ? 'zufallsdate-filter--active' : ''} ${entry.id !== 'all' ? `zufallsdate-filter--${entry.id}` : ''}`}
              onClick={() => setFilter(entry.id)}
              disabled={rolling}
            >
              {entry.label}
            </button>
          ))}
        </div>

        <div
          className={`zufallsdate-result ${rolling ? 'zufallsdate-result--rolling' : ''} ${reveal && result ? 'zufallsdate-result--reveal' : ''}`}
          aria-live="polite"
        >
          {rolling ? (
            <>
              <p className="zufallsdate-result-kicker">Moment…</p>
              <p className="zufallsdate-result-text zufallsdate-result-text--shimmer">
                Wir suchen eine Idee für euch.
              </p>
            </>
          ) : result ? (
            <>
              <span className={`zufallsdate-category-pill zufallsdate-category-pill--${result.category}`}>
                {categoryMeta?.label}
              </span>
              <p className="zufallsdate-result-text">{result.text}</p>
              <p className="zufallsdate-result-hint">{categoryMeta?.hint}</p>
            </>
          ) : (
            <>
              <p className="zufallsdate-result-kicker">Bereit?</p>
              <p className="zufallsdate-result-text zufallsdate-result-text--idle">
                Tippe unten – wir übernehmen die Idee.
              </p>
            </>
          )}
        </div>

        <div className="zufallsdate-actions">
          <button
            type="button"
            className="zufallsdate-roll-btn tap-active"
            onClick={roll}
            disabled={rolling || onCooldown}
          >
            {result ? 'Nochmal würfeln' : 'Zufällige Idee'}
          </button>
        </div>

        {onCooldown && !rolling && (
          <p className="zufallsdate-cooldown" aria-hidden>
            Gleich geht&apos;s weiter…
          </p>
        )}
      </section>
    </div>
  )
}
