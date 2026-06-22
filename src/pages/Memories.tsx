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
import { addMemory, deleteMemory, readImageAsDataUrl } from '../storage/db'
import { getNewestTimestamp } from '../storage/meta'
import { isRecentEntry, isWithinHours } from '../utils/energy'
import { formatDate } from '../utils/formatDate'

export default function Memories() {
  const { user } = useAuth()
  const { memories } = useAppData()
  useSectionVisit('erinnerungen')
  const [searchParams, setSearchParams] = useSearchParams()
  const [text, setText] = useState('')
  const [image, setImage] = useState<string | undefined>()
  const [preview, setPreview] = useState<string | undefined>()
  const [showForm, setShowForm] = useState(false)

  const latestAt = getNewestTimestamp(memories)

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowForm(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await readImageAsDataUrl(file)
    setImage(dataUrl)
    setPreview(dataUrl)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !text.trim()) return

    addMemory({
      userId: user.id,
      userName: user.name,
      text: text.trim(),
      image,
    })
    setText('')
    setImage(undefined)
    setPreview(undefined)
    setShowForm(false)
  }

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        symbol={SYMBOLS.memories}
        title="Erinnerungen"
        subtitle="Für Momente, die bleiben"
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4 animate-fade-in">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Was war besonders?"
            className="input-field min-h-24 resize-none"
            required
            autoFocus
          />

          <label className="block">
            <span className="text-sm text-subtitle mb-2 block">Bild</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
          </label>

          {preview && (
            <img
              src={preview}
              alt="Vorschau"
              className="w-full rounded-xl object-cover max-h-48 opacity-90"
            />
          )}

          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
              Abbrechen
            </button>
            <button type="submit" className="btn-primary flex-1">
              Speichern
            </button>
          </div>
        </form>
      )}

      {memories.length === 0 && !showForm ? (
        <EmptyState
          message={'Noch keine Erinnerungen…\nAber jede beginnt mit einem Moment'}
        />
      ) : (
        <div className="space-y-4">
          {memories.map((memory, index) => {
            const isLatest = memory.createdAt === latestAt
            const isRecent = isRecentEntry(memory.createdAt)
            const isCloseInTime = index > 0 && isWithinHours(memory.createdAt, 6) && isWithinHours(memories[index - 1].createdAt, 6)

            return (
              <article
                key={memory.id}
                className={[
                  'card animate-memory-entry',
                  isLatest ? 'entry-latest' : '',
                  isRecent ? 'entry-recent' : '',
                  isCloseInTime ? 'entry-close-pulse' : '',
                ].filter(Boolean).join(' ')}
              >
                {memory.image && (
                  <img
                    src={memory.image}
                    alt=""
                    className="memory-image w-full rounded-xl object-cover max-h-56 mb-3 opacity-95"
                  />
                )}
                <p className="memory-text text-ink leading-relaxed">{memory.text}</p>
                <div className="flex items-center justify-between mt-3 pt-3 divider-soft">
                  <span className="text-xs text-faint">{formatDate(memory.createdAt)}</span>
                  <div className="flex items-center gap-3">
                    <span className="meta-accent">{memory.userName}</span>
                    <DeleteButton
                      onConfirm={() => deleteMemory(memory.id)}
                      confirmMessage="Erinnerung wirklich löschen?"
                    />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {!showForm && (
        <AddButton label="Neue Erinnerung" onClick={() => setShowForm(true)} />
      )}
    </div>
  )
}
