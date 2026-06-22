import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import AddButton from '../components/AddButton'
import DeleteButton from '../components/DeleteButton'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import { SYMBOLS } from '../constants/symbols'
import { useSectionVisit } from '../hooks/useSectionVisit'
import { useAppData } from '../storage/DataContext'
import { createMoodboard, deleteMoodboard } from '../storage/db'
import { recordUserActivity } from '../storage/meta'

export default function Moodboards() {
  const { user } = useAuth()
  const { moodboards } = useAppData()
  useSectionVisit('moodboards')
  const [searchParams, setSearchParams] = useSearchParams()
  const [title, setTitle] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowForm(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    createMoodboard(title.trim())
    if (user) recordUserActivity(user.id)
    setTitle('')
    setShowForm(false)
  }

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        symbol={SYMBOLS.moodboards}
        title="Moodboards"
        subtitle="Was möchtet ihr gemeinsam erleben?"
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4 animate-fade-in">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Wie soll das Board heißen?"
            className="input-field"
            required
            autoFocus
          />
          <p className="text-xs text-faint">Danach Text, Bilder oder beides hinzufügen.</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
              Abbrechen
            </button>
            <button type="submit" className="btn-primary flex-1">
              Erstellen
            </button>
          </div>
        </form>
      )}

      {moodboards.length === 0 && !showForm ? (
        <EmptyState message="Was möchtet ihr gemeinsam erleben?" />
      ) : (
        <div className="grid gap-3">
          {moodboards.map((board) => {
            const boardTitle = (board.title ?? '').trim() || 'Moodboard'
            const coverItem = board.items.find((item) => item.image)
            const textItem = board.items.find((item) => item.title || item.description)
            const cover = coverItem?.image
            const textPreview = textItem?.title || textItem?.description

            return (
              <article key={board.id} className="card moodboard-list-card animate-moodboard-entry">
                <Link to={`/moodboards/${board.id}`} className="block tap-active moodboard-list-link">
                  <div className="moodboard-list-cover">
                    {cover ? (
                      <img src={cover} alt="" className="moodboard-list-cover-image" />
                    ) : textPreview ? (
                      <div className="moodboard-list-text-preview moodboard-list-cover-fallback">
                        <p className="line-clamp-3">{textPreview}</p>
                      </div>
                    ) : (
                      <div className="moodboard-list-empty-preview moodboard-list-cover-fallback">
                        <span className="section-symbol text-[0.625rem]">{SYMBOLS.moodboards}</span>
                      </div>
                    )}
                    <div className="moodboard-list-cover-meta">
                      <p className="moodboard-list-title">{boardTitle}</p>
                      <p className="moodboard-list-count">
                        {board.items.length} {board.items.length === 1 ? 'Eintrag' : 'Einträge'}
                      </p>
                    </div>
                  </div>
                </Link>
                <div className="moodboard-list-actions">
                  <DeleteButton
                    onConfirm={() => deleteMoodboard(board.id)}
                    confirmMessage={`„${boardTitle}" wirklich löschen?`}
                  />
                </div>
              </article>
            )
          })}
        </div>
      )}

      {!showForm && (
        <AddButton label="Moodboard erstellen" onClick={() => setShowForm(true)} />
      )}
    </div>
  )
}
