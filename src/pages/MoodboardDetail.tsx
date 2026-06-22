import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AddButton from '../components/AddButton'
import DeleteButton from '../components/DeleteButton'
import EmptyState from '../components/EmptyState'
import SectionLabel from '../components/SectionLabel'
import { SYMBOLS } from '../constants/symbols'
import { useAppData } from '../storage/DataContext'
import { addMoodboardItem, deleteMoodboard, deleteMoodboardItem, readImageAsDataUrl } from '../storage/db'
import type { MoodboardItem } from '../types'
import { getDreamVariant } from '../utils/dreamLayout'

export default function MoodboardDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { moodboards } = useAppData()
  const board = useMemo(
    () => (id ? moodboards.find((entry) => entry.id === id) : undefined),
    [id, moodboards]
  )
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<string | undefined>()
  const [preview, setPreview] = useState<string | undefined>()
  const [showForm, setShowForm] = useState(false)

  if (!board) {
    return (
      <div className="text-center py-12">
        <p className="text-faint text-sm">Board nicht gefunden.</p>
        <Link to="/moodboards" className="text-sm text-emerald mt-2 inline-block tap-active">
          Zurück zu Moodboards
        </Link>
      </div>
    )
  }

  const boardTitle = (board.title ?? '').trim() || 'Moodboard'
  const canSubmit = Boolean(title.trim() || description.trim() || image)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await readImageAsDataUrl(file)
    setImage(dataUrl)
    setPreview(dataUrl)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    addMoodboardItem(board.id, {
      title: title.trim() || undefined,
      description: description.trim(),
      image,
    })
    setTitle('')
    setDescription('')
    setImage(undefined)
    setPreview(undefined)
    setShowForm(false)
  }

  const handleDeleteBoard = () => {
    deleteMoodboard(board.id)
    navigate('/moodboards')
  }

  return (
    <div className="space-y-6 pb-16 moodboard-dream-page">
      <div>
        <Link to="/moodboards" className="text-sm text-subtitle tap-active">
          ← Moodboards
        </Link>
        <SectionLabel symbol={SYMBOLS.moodboards} className="mt-3" />
        <div className="flex items-start justify-between gap-3 mt-1">
          <h1 className="text-xl title-calm flex-1">{boardTitle}</h1>
          <DeleteButton
            onConfirm={handleDeleteBoard}
            confirmMessage={`„${boardTitle}" wirklich löschen?`}
          />
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4 animate-fade-in">
          <div>
            <span className="text-sm text-subtitle mb-2 block">Titel (optional)</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z. B. Unser nächster Trip"
              className="input-field"
              maxLength={80}
              autoFocus
            />
          </div>

          <div>
            <span className="text-sm text-subtitle mb-2 block">Text</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ein Wunsch, ein Gedanke, ein Ort…"
              className="input-field min-h-28 resize-none"
              maxLength={500}
            />
          </div>

          <label className="block">
            <span className="text-sm text-subtitle mb-2 block">Bild (optional)</span>
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

          <p className="text-xs text-faint">Text, Bild oder beides — mindestens eins reicht.</p>

          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
              Abbrechen
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={!canSubmit}>
              Hinzufügen
            </button>
          </div>
        </form>
      )}

      {board.items.length === 0 && !showForm ? (
        <EmptyState message={'Noch nichts drin…\nFügt Text, Bilder oder beides hinzu'} />
      ) : (
        <div className="moodboard-dream" aria-label="Geteilter Traumraum">
          {board.items.map((item: MoodboardItem, index) => {
            const dream = getDreamVariant(index)
            const isTextOnly = !item.image && Boolean(item.description.trim() || item.title?.trim())

            return (
              <article
                key={item.id}
                data-variant={dream.variant}
                data-depth={dream.depth}
                data-glow={dream.glow ? 'true' : undefined}
                data-mode={isTextOnly ? 'text' : item.image && item.description ? 'mixed' : 'image'}
                className={[
                  'moodboard-dream-item card',
                  isTextOnly ? 'moodboard-dream-item--text' : '',
                ].filter(Boolean).join(' ')}
                style={{ animationDelay: `${dream.delay}ms` }}
              >
                <div className="moodboard-dream-item-actions">
                  <DeleteButton
                    onConfirm={() => deleteMoodboardItem(board.id, item.id)}
                    confirmMessage="Eintrag wirklich löschen?"
                  />
                </div>

                {item.image && (
                  <div className="moodboard-dream-image-wrap">
                    <img src={item.image} alt="" className="moodboard-dream-image" />
                  </div>
                )}

                {(item.title || item.description) && (
                  <div className={isTextOnly ? 'moodboard-dream-text-body' : 'moodboard-dream-copy'}>
                    {item.title && (
                      <p className={isTextOnly ? 'moodboard-dream-title' : 'moodboard-dream-caption-title'}>
                        {item.title}
                      </p>
                    )}
                    {item.description && (
                      <p className={isTextOnly ? 'moodboard-dream-text' : 'moodboard-dream-caption'}>
                        {item.description}
                      </p>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      {!showForm && (
        <AddButton label="Eintrag hinzufügen" onClick={() => setShowForm(true)} />
      )}
    </div>
  )
}
