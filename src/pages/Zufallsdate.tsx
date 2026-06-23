import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ACTIVITY_CATEGORIES,
  ACTIVITY_VIBES,
  type ActivityFilter,
  type ActivityVibe,
  type RandomActivityResult,
  type ZufallsdateQuery,
  pickRandomActivity,
  pickShufflePreviews,
} from '../content/zufallsdate'

const TICK_MS_MIN = 80
const TICK_MS_MAX = 120
const FINAL_MS = 280
const COOLDOWN_MS = 1800

const FILTERS: Array<{ id: ActivityFilter; label: string }> = [
  { id: 'all', label: 'Alle mischen' },
  { id: 'alltag', label: ACTIVITY_CATEGORIES.alltag.label },
  { id: 'dates', label: ACTIVITY_CATEGORIES.dates.label },
  { id: 'liebe', label: ACTIVITY_CATEGORIES.liebe.label },
]

function randomTickMs(): number {
  return TICK_MS_MIN + Math.floor(Math.random() * (TICK_MS_MAX - TICK_MS_MIN + 1))
}

export default function Zufallsdate() {
  const [filter, setFilter] = useState<ActivityFilter>('all')
  const [vibes, setVibes] = useState<ActivityVibe[]>([])
  const [result, setResult] = useState<RandomActivityResult | null>(null)
  const [rolling, setRolling] = useState(false)
  const [reveal, setReveal] = useState(false)
  const [finalReveal, setFinalReveal] = useState(false)
  const [shuffleText, setShuffleText] = useState('')
  const [shuffleTick, setShuffleTick] = useState(0)
  const [cooldownLeft, setCooldownLeft] = useState(0)
  const cooldownUntil = useRef(0)
  const shuffleTimers = useRef<number[]>([])
  const tickMsRef = useRef(100)

  const clearShuffleTimers = useCallback(() => {
    shuffleTimers.current.forEach((id) => window.clearTimeout(id))
    shuffleTimers.current = []
  }, [])

  const toggleVibe = (vibe: ActivityVibe) => {
    setVibes((prev) =>
      prev.includes(vibe) ? prev.filter((entry) => entry !== vibe) : [...prev, vibe]
    )
  }

  useEffect(() => {
    if (cooldownLeft <= 0) return

    const tick = window.setInterval(() => {
      const remaining = Math.max(0, cooldownUntil.current - Date.now())
      setCooldownLeft(remaining)
    }, 100)

    return () => window.clearInterval(tick)
  }, [cooldownLeft])

  useEffect(() => clearShuffleTimers, [clearShuffleTimers])

  const startCooldown = useCallback(() => {
    cooldownUntil.current = Date.now() + COOLDOWN_MS
    setCooldownLeft(COOLDOWN_MS)
  }, [])

  const roll = useCallback(() => {
    if (rolling || cooldownLeft > 0) return

    clearShuffleTimers()
    setRolling(true)
    setReveal(false)
    setFinalReveal(false)
    setShuffleText('')
    startCooldown()

    const query: ZufallsdateQuery = { category: filter, vibes }
    const final = pickRandomActivity(query, result)
    const previewCount = 3 + Math.floor(Math.random() * 3)
    const previews = pickShufflePreviews(query, final, previewCount)
    const tickMs = randomTickMs()
    tickMsRef.current = tickMs

    previews.forEach((text, index) => {
      const id = window.setTimeout(() => {
        setShuffleText(text)
        setShuffleTick((value) => value + 1)
      }, index * tickMs)
      shuffleTimers.current.push(id)
    })

    const finishAt = previews.length * tickMs
    const finishId = window.setTimeout(() => {
      setResult(final)
      setRolling(false)
      setReveal(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setFinalReveal(true))
      })
    }, finishAt)
    shuffleTimers.current.push(finishId)
  }, [clearShuffleTimers, cooldownLeft, filter, vibes, result, rolling, startCooldown])

  const categoryMeta = result ? ACTIVITY_CATEGORIES[result.category] : null
  const onCooldown = cooldownLeft > 0 && !rolling

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

        <div className="zufallsdate-vibes-wrap">
          <p className="zufallsdate-vibes-label">Optional</p>
          <div className="zufallsdate-vibes">
            {ACTIVITY_VIBES.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={`zufallsdate-vibe tap-active ${vibes.includes(entry.id) ? 'zufallsdate-vibe--active' : ''}`}
                onClick={() => toggleVibe(entry.id)}
                disabled={rolling}
                aria-pressed={vibes.includes(entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`zufallsdate-result ${rolling ? 'zufallsdate-result--rolling' : ''} ${reveal && result && finalReveal ? `zufallsdate-result--reveal zufallsdate-result--reveal-${result.category}` : ''}`}
          aria-live="polite"
        >
          {rolling ? (
            <>
              <p className="zufallsdate-result-kicker">Einen Moment…</p>
              <div className="zufallsdate-shuffle-slot">
                <p
                  key={shuffleTick}
                  className="zufallsdate-result-text zufallsdate-result-text--shuffle"
                  style={{ animationDuration: `${tickMsRef.current}ms` }}
                >
                  {shuffleText || '…'}
                </p>
              </div>
            </>
          ) : result && reveal ? (
            <>
              <span
                className={`zufallsdate-category-pill zufallsdate-category-pill--${result.category} ${finalReveal ? 'zufallsdate-category-pill--drop' : ''}`}
              >
                {categoryMeta?.label}
              </span>
              <p
                className={`zufallsdate-result-text zufallsdate-result-text--final ${finalReveal ? 'zufallsdate-result-text--final-active' : ''}`}
                style={{ animationDuration: `${FINAL_MS}ms` }}
              >
                {result.text}
              </p>
              <p
                className={`zufallsdate-result-hint ${finalReveal ? 'zufallsdate-result-hint--drop' : ''}`}
              >
                {categoryMeta?.hint}
              </p>
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
            className={`zufallsdate-roll-btn tap-active ${rolling ? 'zufallsdate-roll-btn--busy' : ''}`}
            onClick={roll}
            disabled={rolling || onCooldown}
          >
            {result ? 'Nochmal würfeln' : 'Zufällige Idee'}
          </button>
        </div>

        {onCooldown && (
          <p className="zufallsdate-cooldown" aria-hidden>
            Gleich geht&apos;s weiter…
          </p>
        )}
      </section>
    </div>
  )
}
