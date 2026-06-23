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
    <article className={`penalty-card card animate-fade-in penalty-card--${entry.type}`}>
      <div className="penalty-card-top">
        <div>
          <p className="penalty-category">{entry.category}</p>
          <h2 className="law-title">{entry.title}</h2>
        </div>
        <div
          className={`penalty-points-badge ${delta < 0 ? 'penalty-points-badge--minus' : ''}`}
        >
          {delta > 0 ? `+${delta}` : delta} P
        </div>
      </div>

      <p className="law-text">{entry.description}</p>

      {lastApplied && <p className="penalty-last-applied">Zuletzt: {lastApplied}</p>}

      <div className="penalty-actions">
        {USERS.map((target) => {
          const key = `${entry.id}-${target.id}`
          const justApplied = appliedId === key
          const disabled = disabledFor?.(target.id) ?? false

          return (
            <button
              key={target.id}
              type="button"
              className={`penalty-apply-btn tap-active ${justApplied ? 'penalty-apply-btn--done' : ''} ${delta < 0 ? 'penalty-apply-btn--redemption' : ''}`}
              onClick={() => onApply(entry, target.id)}
              disabled={disabled}
            >
              {justApplied ? '✓ Angewendet' : `Für ${target.name}`}
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

  const nextAnniversary = useMemo(() => getNextRelationshipAnniversary(), [])
  const relationshipMonth = useMemo(() => getCurrentRelationshipMonthIndex(), [])
  const timeline = useMemo(
    () => buildPenaltyTimeline({ penaltyApplications, penaltyMonthHistory }),
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

  const handleApplyStrafe = (entry: CatalogEntry, targetUserId: string) => {
    if (!user) return
    const target = USERS.find((u) => u.id === targetUserId)
    if (!target) return

    if (!window.confirm(`„${entry.title}" (+${POINT_DELTA}) für ${target.name}?`)) return

    applyPenalty({
      penaltyId: entry.id,
      kind: 'strafe',
      title: entry.title,
      targetUserId: target.id,
      targetUserName: target.name,
      appliedByUserId: user.id,
      appliedByUserName: user.name,
    })

    setAppliedId(`${entry.id}-${targetUserId}`)
    window.setTimeout(() => setAppliedId(null), 1200)
  }

  const handleApplyWiedergutmachung = (entry: CatalogEntry, targetUserId: string) => {
    if (!user) return
    const target = USERS.find((u) => u.id === targetUserId)
    if (!target) return

    const current = penaltyScores[target.id]
    if (current <= 0) return

    if (!window.confirm(`„${entry.title}" (−${POINT_DELTA}) für ${target.name}?`)) return

    const result = applyRedemption({
      penaltyId: entry.id,
      title: entry.title,
      targetUserId: target.id,
      targetUserName: target.name,
      appliedByUserId: user.id,
      appliedByUserName: user.name,
    })

    if (!result) return

    setAppliedId(`${entry.id}-${targetUserId}`)
    window.setTimeout(() => setAppliedId(null), 1200)
  }

  const handleManualGrant = (targetUserId: string, targetUserName: string) => {
    if (!user) return
    if (!window.confirm(`+${POINT_DELTA} Punkt manuell an ${targetUserName} vergeben?`)) return

    grantManualPenaltyPoint({
      targetUserId,
      targetUserName,
      appliedByUserId: user.id,
      appliedByUserName: user.name,
    })
  }

  const handleManualDeduct = (targetUserId: string, targetUserName: string) => {
    if (!user) return
    if (penaltyScores[targetUserId as keyof typeof penaltyScores] <= 0) return

    if (
      !window.confirm(
        `−${POINT_DELTA} Punkt bei ${targetUserName} manuell abbauen? (Wiedergutmachung / erledigt)`
      )
    ) {
      return
    }

    deductManualPenaltyPoint({
      targetUserId,
      targetUserName,
      appliedByUserId: user.id,
      appliedByUserName: user.name,
    })
  }

  return (
    <div className="document-page space-y-8 pb-16">
      <div>
        <Link to="/" className="text-sm nav-back tap-active">
          ← Home
        </Link>
        <Link to="/beziehungsgesetzbuch" className="text-sm nav-back tap-active block mt-2">
          ← Beziehungsgesetzbuch
        </Link>
        <p className="document-kicker mt-4">Strafkatalog</p>
        <h1 className="document-title">Punkte & Wiedergutmachung.</h1>
        <p className="document-subtitle">
          Strafen +1 · Wiedergutmachungen −1 · Beziehungsmonat −1 automatisch.
        </p>
      </div>

      <section className="penalty-scoreboard document-block animate-fade-in">
        <p className="document-label">Punktestand</p>
        <div className="penalty-score-grid">
          {USERS.map((entry) => (
            <div key={entry.id} className="penalty-score-card">
              <p className="penalty-score-name">{entry.name}</p>
              <p className="penalty-score-value">{penaltyScores[entry.id]}</p>
              <p className="penalty-score-label">
                {penaltyScores[entry.id] === 1 ? 'Punkt' : 'Punkte'}
              </p>
              <div className="penalty-manual-actions">
                <button
                  type="button"
                  className="penalty-manual-btn penalty-manual-btn--grant tap-active"
                  onClick={() => handleManualGrant(entry.id, entry.name)}
                >
                  +1 vergeben
                </button>
                <button
                  type="button"
                  className="penalty-manual-btn penalty-manual-btn--deduct tap-active"
                  onClick={() => handleManualDeduct(entry.id, entry.name)}
                  disabled={penaltyScores[entry.id] <= 0}
                >
                  −1 abbauen
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="penalty-counter-meta">
          <div className="penalty-counter-meta-item">
            <p className="penalty-counter-meta-label">Beziehungsstart</p>
            <p className="penalty-counter-meta-value">{RELATIONSHIP_START_LABEL}</p>
          </div>
          <div className="penalty-counter-meta-item">
            <p className="penalty-counter-meta-label">Beziehungsmonat</p>
            <p className="penalty-counter-meta-value">Monat {relationshipMonth}</p>
          </div>
          <div className="penalty-counter-meta-item">
            <p className="penalty-counter-meta-label">Nächster Beziehungsmonat</p>
            <p className="penalty-counter-meta-value">{formatAnniversaryLabel(nextAnniversary)}</p>
          </div>
          <div className="penalty-counter-meta-item">
            <p className="penalty-counter-meta-label">Letzte Monatsanpassung</p>
            <p className="penalty-counter-meta-value">
              {penaltyMeta.lastProcessedAnniversary
                ? formatMonthLabel(penaltyMeta.lastProcessedAnniversary)
                : 'Noch keine'}
            </p>
          </div>
        </div>

        <p className="penalty-counter-hint">
          Manuell: +1 vergeben oder −1 abbauen direkt am Counter — zusätzlich zu den Katalog-Tabs.
        </p>
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

        <p className="document-label px-1 mb-3 mt-5">Kategorien</p>
        <div className="penalty-filters">
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

      <section className="space-y-3">
        {filtered.map((entry) => (
          <CatalogCard
            key={entry.id}
            entry={entry}
            delta={tab === 'strafen' ? POINT_DELTA : -POINT_DELTA}
            lastApplied={
              lastByEntry.get(entry.id)
                ? formatDate(lastByEntry.get(entry.id)!)
                : undefined
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

      <section className="document-block animate-fade-in">
        <p className="document-label">Timeline</p>
        {timeline.length === 0 ? (
          <p className="law-text">Noch keine Einträge — der Katalog wartet geduldig.</p>
        ) : (
          <ul className="penalty-timeline">
            {timeline.map((entry) => (
              <li
                key={entry.id}
                className={`penalty-timeline-item penalty-timeline-item--${entry.kind}`}
              >
                <span
                  className={`penalty-timeline-delta ${entry.delta > 0 ? 'penalty-timeline-delta--plus' : 'penalty-timeline-delta--minus'}`}
                >
                  {formatTimelineDelta(entry.delta)}
                </span>
                <div className="penalty-timeline-body">
                  <p className="penalty-history-title">{entry.label}</p>
                  <p className="penalty-history-meta">
                    {entry.targetUserName}
                    {entry.appliedByUserName !== 'System' && ` · von ${entry.appliedByUserName}`}
                  </p>
                </div>
                <time className="penalty-history-time">{formatDate(entry.at)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
