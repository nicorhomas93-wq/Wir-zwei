import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { RELATIONSHIP_START_LABEL } from '../constants/relationship'
import { PENALTY_CATEGORIES, PENALTY_POINTS, STRAFKATALOG } from '../content/strafkatalog'
import { useAppData } from '../storage/DataContext'
import { applyPenalty, deductManualPenaltyPoint, grantManualPenaltyPoint } from '../storage/db'
import { formatDate, formatDateTime } from '../utils/formatDate'
import {
  formatAnniversaryLabel,
  getCurrentRelationshipMonthIndex,
  getNextRelationshipAnniversary,
  parseDateKey,
} from '../utils/relationshipMonth'

const USERS = [
  { id: 'marie', name: 'Marie' },
  { id: 'nico', name: 'Nico' },
] as const

export default function Strafkatalog() {
  const { user } = useAuth()
  const { penaltyApplications, penaltyScores, penaltyMeta, penaltyMonthHistory } = useAppData()
  const [category, setCategory] = useState<string>('Alle')
  const [appliedId, setAppliedId] = useState<string | null>(null)

  const nextAnniversary = useMemo(() => getNextRelationshipAnniversary(), [])
  const relationshipMonth = useMemo(() => getCurrentRelationshipMonthIndex(), [])

  const recent = useMemo(
    () =>
      [...penaltyApplications]
        .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
        .slice(0, 12),
    [penaltyApplications]
  )

  const filtered =
    category === 'Alle'
      ? STRAFKATALOG
      : STRAFKATALOG.filter((entry) => entry.category === category)

  const lastByPenalty = useMemo(() => {
    const map = new Map<string, string>()
    for (const entry of penaltyApplications) {
      if (!map.has(entry.penaltyId)) map.set(entry.penaltyId, entry.appliedAt)
    }
    return map
  }, [penaltyApplications])

  const handleApply = (penaltyId: string, title: string, targetUserId: string) => {
    if (!user) return

    const target = USERS.find((entry) => entry.id === targetUserId)
    if (!target) return

    const message = `„${title}" (+${PENALTY_POINTS} Punkt) für ${target.name} anwenden?`
    if (!window.confirm(message)) return

    applyPenalty({
      penaltyId,
      title,
      targetUserId: target.id,
      targetUserName: target.name,
      appliedByUserId: user.id,
      appliedByUserName: user.name,
    })

    setAppliedId(`${penaltyId}-${targetUserId}`)
    window.setTimeout(() => setAppliedId(null), 1200)
  }

  const handleManualGrant = (targetUserId: string, targetUserName: string) => {
    if (!user) return
    if (!window.confirm(`+${PENALTY_POINTS} Punkt manuell an ${targetUserName} vergeben?`)) return

    grantManualPenaltyPoint({
      targetUserId,
      targetUserName,
      appliedByUserId: user.id,
      appliedByUserName: user.name,
    })
  }

  const handleManualDeduct = (targetUserId: string, targetUserName: string) => {
    if (!user) return
    const current = penaltyScores[targetUserId as keyof typeof penaltyScores]
    if (current <= 0) return

    if (
      !window.confirm(
        `−${PENALTY_POINTS} Punkt bei ${targetUserName} abbauen? (Wiedergutmachung / erledigt)`
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
          Punkte manuell vergeben oder abbauen. Pro Beziehungsmonat zusätzlich −1 automatisch.
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
            <p className="penalty-counter-meta-label">Letzter Monatsabzug</p>
            <p className="penalty-counter-meta-value">
              {penaltyMeta.lastProcessedAnniversary
                ? formatDate(parseDateKey(penaltyMeta.lastProcessedAnniversary).toISOString())
                : 'Noch keiner'}
            </p>
          </div>
        </div>

        <p className="penalty-counter-hint">
          Manuell: „+1 vergeben" oder Strafe aus dem Katalog · „−1 abbauen" bei Wiedergutmachung.
          Automatisch: Am Beziehungstag (30. oder letzter Tag im Monat) −1 pro Person — nie unter 0.
        </p>
      </section>

      <section className="animate-fade-in">
        <p className="document-label px-1 mb-3">Kategorien</p>
        <div className="penalty-filters">
          <button
            type="button"
            className={`penalty-filter tap-active ${category === 'Alle' ? 'penalty-filter--active' : ''}`}
            onClick={() => setCategory('Alle')}
          >
            Alle
          </button>
          {PENALTY_CATEGORIES.map((entry) => (
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
        {filtered.map((entry) => {
          const lastApplied = lastByPenalty.get(entry.id)

          return (
            <article key={entry.id} className="penalty-card card animate-fade-in">
              <div className="penalty-card-top">
                <div>
                  <p className="law-paragraph">{entry.paragraph}</p>
                  <h2 className="law-title">{entry.title}</h2>
                  {entry.category && <p className="penalty-category">{entry.category}</p>}
                </div>
                <div className="penalty-points-badge">{PENALTY_POINTS} P</div>
              </div>

              <p className="law-text">{entry.description}</p>

              {lastApplied && (
                <p className="penalty-last-applied">Zuletzt: {formatDateTime(lastApplied)}</p>
              )}

              <div className="penalty-actions">
                {USERS.map((target) => {
                  const key = `${entry.id}-${target.id}`
                  const justApplied = appliedId === key

                  return (
                    <button
                      key={target.id}
                      type="button"
                      className={`penalty-apply-btn tap-active ${justApplied ? 'penalty-apply-btn--done' : ''}`}
                      onClick={() => handleApply(entry.id, entry.title, target.id)}
                    >
                      {justApplied ? '✓ Angewendet' : `Für ${target.name}`}
                    </button>
                  )
                })}
              </div>
            </article>
          )
        })}
      </section>

      <section className="document-block animate-fade-in">
        <p className="document-label">Straf-Verlauf</p>
        {recent.length === 0 ? (
          <p className="law-text">Noch keine Strafen angewendet.</p>
        ) : (
          <ul className="penalty-history">
            {recent.map((entry) => (
              <li key={entry.id} className="penalty-history-item">
                <div>
                  <p className="penalty-history-title">{entry.title}</p>
                  <p className="penalty-history-meta">
                    {entry.targetUserName}
                    {entry.points > 0 ? ` · +${entry.points} P` : ` · ${entry.points} P`}
                    {' · '}
                    von {entry.appliedByUserName}
                  </p>
                </div>
                <time className="penalty-history-time">{formatDateTime(entry.appliedAt)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="document-block animate-fade-in">
        <p className="document-label">Beziehungsmonate — Abzüge</p>
        {penaltyMonthHistory.length === 0 ? (
          <p className="law-text">Noch kein Beziehungsmonats-Abzug verarbeitet.</p>
        ) : (
          <ul className="penalty-month-history">
            {penaltyMonthHistory.map((entry) => (
              <li key={entry.id} className="penalty-month-history-item">
                <div>
                  <p className="penalty-history-title">
                    {formatDate(parseDateKey(entry.anniversaryDate).toISOString())}
                  </p>
                  <p className="penalty-history-meta">
                    Marie {entry.scoresBefore.marie} → {entry.scoresAfter.marie}
                    {' · '}
                    Nico {entry.scoresBefore.nico} → {entry.scoresAfter.nico}
                  </p>
                </div>
                <span className="penalty-month-badge">−1 je Person</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
