import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import AddButton from '../components/AddButton'
import DeleteButton from '../components/DeleteButton'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import { SYMBOLS } from '../constants/symbols'
import { useSectionVisit } from '../hooks/useSectionVisit'
import { useAppData } from '../storage/DataContext'
import { addThought, deleteThought } from '../storage/db'
import { getNewestTimestamp } from '../storage/meta'
import { isRecentEntry, isWithinHours } from '../utils/energy'
import { formatDateTime } from '../utils/formatDate'

export default function Thoughts() {
  const { user } = useAuth()
  const { thoughts } = useAppData()
  useSectionVisit('gedanken')
  const [searchParams, setSearchParams] = useSearchParams()
  const [text, setText] = useState('')
  const [showForm, setShowForm] = useState(false)

  const latestAt = getNewestTimestamp(thoughts)

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowForm(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !text.trim()) return

    addThought({
      userId: user.id,
      userName: user.name,
      text: text.trim(),
    })
    setText('')
    setShowForm(false)
  }

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        symbol={SYMBOLS.thoughts}
        title="Gedanken"
        subtitle="Ein paar Worte nur für euch"
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4 animate-fade-in">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Was möchtest du sagen?"
            className="input-field"
            maxLength={280}
            autoFocus
            required
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
              Abbrechen
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={!text.trim()}>
              Senden
            </button>
          </div>
        </form>
      )}

      {thoughts.length === 0 && !showForm ? (
        <EmptyState message={'Noch keine Gedanken…\nVielleicht beginnt einer von euch 🔥❤️'} />
      ) : (
        <ul className="space-y-3">
          {thoughts.map((thought, index) => {
            const isLatest = thought.createdAt === latestAt
            const isRecent = isRecentEntry(thought.createdAt)
            const isCloseInTime =
              index > 0 &&
              isWithinHours(thought.createdAt, 6) &&
              isWithinHours(thoughts[index - 1].createdAt, 6)

            return (
              <li
                key={thought.id}
                className={[
                  'card animate-thought-entry',
                  isLatest ? 'entry-latest' : '',
                  isRecent ? 'entry-recent' : '',
                  isCloseInTime ? 'entry-close-pulse' : '',
                ].filter(Boolean).join(' ')}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-ink flex-1">{thought.text}</p>
                  <DeleteButton
                    onConfirm={() => deleteThought(thought.id)}
                    confirmMessage="Gedanken wirklich löschen?"
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="meta-accent">{thought.userName}</span>
                  <time className="text-xs text-faint">{formatDateTime(thought.createdAt)}</time>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {!showForm && (
        <AddButton label="Gedanke schreiben" onClick={() => setShowForm(true)} />
      )}
    </div>
  )
}
