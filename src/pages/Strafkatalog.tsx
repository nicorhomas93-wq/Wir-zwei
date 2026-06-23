import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { RELATIONSHIP_START_LABEL } from '../constants/relationship'
import type { CatalogEntry } from '../content/strafkatalog'
import {
  POINT_DELTA,
  STRAFEN,
  STRAFEN_KATEGORIEN,
  WIEDERGUTMACHUNG_KATEGORIEN,
  WIEDERGUTMACHUNGEN,
} from '../content/strafkatalog'
import { useAppData } from '../storage/DataContext'
import { applyPenalty, applyRedemption, deductManualPenaltyPoint, grantManualPenaltyPoint } from '../storage/db'
import { formatDate } from '../utils/formatDate'
import { buildPenaltyTimeline, formatMonthLabel, formatTimelineDelta } from '../utils/penaltyTimeline'
import {
  formatAnniversaryLabel,
  getCurrentRelationshipMonthIndex,
  getNextRelationshipAnniversary,
} from '../utils/relationshipMonth'

const USERS = [
  { id: 'marie', name: 'Marie' },
  { id: 'nico', name: 'Nico' },
] as const

const MINI_TIMELINE_LIMIT = 8

type CatalogTab = 'strafen' | 'wiedergutmachungen'

function CatalogCard({
  entry,
  delta,
  lastApplied,
  appliedId,
  onApply,
  disabledFor,
}: {
  entry: CatalogEntry
  delta: number
  lastApplied?: string
  appliedId: string | null
  onApply: (entry: CatalogEntry, targetUserId: string) => void
  disabledFor?: (targetUserId: string) => boolean
}) {
  return (
    <article className={`penalty-card card penalty-card--${entry.type}`}>
      <div className="penalty-card-top">
        <div className="penalty-card-main">
          <span className="penalty-category-pill">{entry.category}</span>
          <h2 className="penalty-card-title">{entry.title}</h2>
        </div>
        <div className={`penalty-points-badge ${delta < 0 ? 'penalty-points-badge--minus' : ''}`}>
          {delta > 0 ? `+${delta}` : delta} P
        </div>
      </div>

      <p className="penalty-card-desc">{entry.description}</p>

      {lastApplied && <p className="penalty-last-applied">Zuletzt · {lastApplied}</p>}

      <div className="penalty-actions penalty-actions--split">
        {USERS.map((target) => {
          const key = `${entry.id}-${target.id}`
          const justApplied = appliedId === key
          const disabled = disabledFor?.(target.id) ?? false

          return (
            <button
              key={target.id}
              type="button"
              className={`penalty-apply-btn tap-active penalty-apply-btn--${target.id} ${justApplied ? 'penalty-apply-btn--done' : ''} ${delta < 0 ? 'penalty-apply-btn--redemption' : ''}`}
              onClick={() => onApply(entry, target.id)}
              disabled={disabled}
            >
              {justApplied ? '✓' : target.name}
            </button>
          )
        })}
      </div>
    </article>
  )
}

export default function Strafkatalog() {
  const { user } = useAuth()
  const { penaltyApplications, penaltyScores, penaltyMeta, penaltyMonthHistory } = useAppData()
  const [tab, setTab] = useState<CatalogTab>('strafen')
  const [category, setCategory] = useState<string>('Alle')
  const [appliedId, setAppliedId] = useState<string | null>(null)
  const [flashUserId, setFlashUserId] = useState<string | null>(null)

  const nextAnniversary = useMemo(() => getNextRelationshipAnniversary(), [])
  const relationshipMonth = useMemo(() => getCurrentRelationshipMonthIndex(), [])
  const miniTimeline = useMemo(
    () =>
      buildPenaltyTimeline({ penaltyApplications, penaltyMonthHistory }).slice(0, MINI_TIMELINE_LIMIT),
    [penaltyApplications, penaltyMonthHistory]
  )

  const activeList = tab === 'strafen' ? STRAFEN : WIEDERGUTMACHUNGEN
  const activeCategories =
    tab === 'strafen' ? STRAFEN_KATEGORIEN : WIEDERGUTMACHUNG_KATEGORIEN

  const filtered =
    category === 'Alle'
      ? activeList
      : activeList.filter((entry) => entry.category === category)

  const lastByEntry = useMemo(() => {
    const map = new Map<string, string>()
    for (const entry of penaltyApplications) {
      if (!map.has(entry.penaltyId)) {
        map.set(entry.penaltyId, entry.appliedAt)
      }
    }
    return map
  }, [penaltyApplications])

  const flashScore = (targetUserId: string, entryKey: string) => {
    setAppliedId(entryKey)
    setFlashUserId(targetUserId)
    window.setTimeout(() => {
      setAppliedId(null)
      setFlashUserId(null)
    }, 700)
  }

  const handleApplyStrafe = (entry: CatalogEntry, targetUserId: string) => {
    if (!user) return
    const target = USERS.find((u) => u.id === targetUserId)
    if (!target) return

    applyPenalty({
      penaltyId: entry.id,
      kind: 'strafe',
      title: entry.title,
      targetUserId: target.id,
      targetUserName: target.name,
      appliedByUserId: user.id,
      appliedByUserName: user.name,
    })

    flashScore(targetUserId, `${entry.id}-${targetUserId}`)
  }

  const handleApplyWiedergutmachung = (entry: CatalogEntry, targetUserId: string) => {
    if (!user) return
    const target = USERS.find((u) => u.id === targetUserId)
    if (!target) return
    if (penaltyScores[target.id] <= 0) return

    const result = applyRedemption({
      penaltyId: entry.id,
      title: entry.title,
      targetUserId: target.id,
      targetUserName: target.name,
      appliedByUserId: user.id,
      appliedByUserName: user.name,
    })

    if (!result) return
    flashScore(targetUserId, `${entry.id}-${targetUserId}`)
  }

  const handleManualGrant = (targetUserId: string, targetUserName: string) => {
    if (!user) return

    grantManualPenaltyPoint({
      targetUserId,
      targetUserName,
      appliedByUserId: user.id,
      appliedByUserName: user.name,
    })

    flashScore(targetUserId, `manual-grant-${targetUserId}`)
  }

  const handleManualDeduct = (targetUserId: string, targetUserName: string) => {
    if (!user) return
    if (penaltyScores[targetUserId as keyof typeof penaltyScores] <= 0) return

    const result = deductManualPenaltyPoint({
      targetUserId,
      targetUserName,
      appliedByUserId: user.id,
      appliedByUserName: user.name,
    })

    if (!result) return
    flashScore(targetUserId, `manual-deduct-${targetUserId}`)
  }

  const nextMonthShort = formatAnniversaryLabel(nextAnniversary).replace(/\s\d{4}$/, '')

  return (
    <div className="document-page penalty-page space-y-5 pb-16">
      <div className="penalty-page-header">
        <Link to="/" className="text-sm nav-back tap-active">
          ← Home
        </Link>
        <p className="document-kicker mt-3">Strafkatalog</p>
        <h1 className="document-title text-xl">Punkte & Wiedergutmachung</h1>
      </div>

      <section className="penalty-scoreboard penalty-scoreboard--compact document-block animate-fade-in">
        <div className="penalty-score-hero">
          {USERS.map((entry) => (
            <div
              key={entry.id}
              className={`penalty-score-card penalty-score-card--hero ${flashUserId === entry.id ? 'penalty-score-card--flash' : ''}`}
            >
              <p className="penalty-score-name">{entry.name}</p>
              <p className="penalty-score-value">{penaltyScores[entry.id]}</p>
              <div className="penalty-manual-actions penalty-manual-actions--row">
                <button
                  type="button"
                  className="penalty-manual-btn penalty-manual-btn--grant tap-active"
                  onClick={() => handleManualGrant(entry.id, entry.name)}
                >
                  +1
                </button>
                <button
                  type="button"
                  className="penalty-manual-btn penalty-manual-btn--deduct tap-active"
                  onClick={() => handleManualDeduct(entry.id, entry.name)}
                  disabled={penaltyScores[entry.id] <= 0}
                  title="Schnell ausgleichen"
                >
                  −1 ausgleichen
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="penalty-counter-meta penalty-counter-meta--compact">
          <div className="penalty-counter-meta-item">
            <p className="penalty-counter-meta-label">Start</p>
            <p className="penalty-counter-meta-value">{RELATIONSHIP_START_LABEL}</p>
          </div>
          <div className="penalty-counter-meta-item">
            <p className="penalty-counter-meta-label">Monat</p>
            <p className="penalty-counter-meta-value">{relationshipMonth}</p>
          </div>
          <div className="penalty-counter-meta-item">
            <p className="penalty-counter-meta-label">Nächster</p>
            <p className="penalty-counter-meta-value">{nextMonthShort}</p>
          </div>
          <div className="penalty-counter-meta-item">
            <p className="penalty-counter-meta-label">Letzte Anpassung</p>
            <p className="penalty-counter-meta-value">
              {penaltyMeta.lastProcessedAnniversary
                ? formatMonthLabel(penaltyMeta.lastProcessedAnniversary).replace(/\s\d{4}$/, '')
                : '—'}
            </p>
          </div>
        </div>

        {miniTimeline.length > 0 && (
          <div className="penalty-mini-timeline">
            <p className="penalty-mini-timeline-label">Verlauf</p>
            <ul className="penalty-mini-timeline-list">
              {miniTimeline.map((item) => (
                <li key={item.id} className="penalty-mini-timeline-item">
                  <span
                    className={`penalty-mini-timeline-delta ${item.delta > 0 ? 'penalty-mini-timeline-delta--plus' : 'penalty-mini-timeline-delta--minus'}`}
                  >
                    {formatTimelineDelta(item.delta)}
                  </span>
                  <span className="penalty-mini-timeline-text">
                    {item.label}
                    <span className="penalty-mini-timeline-who"> · {item.targetUserName}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="animate-fade-in">
        <div className="penalty-tabs">
          <button
            type="button"
            className={`penalty-tab tap-active ${tab === 'strafen' ? 'penalty-tab--active penalty-tab--strafe' : ''}`}
            onClick={() => {
              setTab('strafen')
              setCategory('Alle')
            }}
          >
            Strafen
            <span className="penalty-tab-delta">+1</span>
          </button>
          <button
            type="button"
            className={`penalty-tab tap-active ${tab === 'wiedergutmachungen' ? 'penalty-tab--active penalty-tab--redemption' : ''}`}
            onClick={() => {
              setTab('wiedergutmachungen')
              setCategory('Alle')
            }}
          >
            Wiedergutmachungen
            <span className="penalty-tab-delta">−1</span>
          </button>
        </div>

        <div className="penalty-filters penalty-filters--compact">
          <button
            type="button"
            className={`penalty-filter tap-active ${category === 'Alle' ? 'penalty-filter--active' : ''}`}
            onClick={() => setCategory('Alle')}
          >
            Alle
          </button>
          {activeCategories.map((entry) => (
            <button
              key={entry}
              type="button"
              className={`penalty-filter tap-active ${category === entry ? 'penalty-filter--active' : ''}`}
              onClick={() => setCategory(entry)}
            >
              {entry}
            </button>
          ))}
        </div>
      </section>

      <section className="penalty-catalog space-y-2.5">
        {filtered.map((entry) => (
          <CatalogCard
            key={entry.id}
            entry={entry}
            delta={tab === 'strafen' ? POINT_DELTA : -POINT_DELTA}
            lastApplied={
              lastByEntry.get(entry.id) ? formatDate(lastByEntry.get(entry.id)!) : undefined
            }
            appliedId={appliedId}
            onApply={tab === 'strafen' ? handleApplyStrafe : handleApplyWiedergutmachung}
            disabledFor={
              tab === 'wiedergutmachungen'
                ? (targetUserId) => penaltyScores[targetUserId as keyof typeof penaltyScores] <= 0
                : undefined
            }
          />
        ))}
      </section>
    </div>
  )
}
