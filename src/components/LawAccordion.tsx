import { useEffect, useState } from 'react'
import type { LawChapter } from '../content/beziehungsgesetzbuch'

interface LawAccordionProps {
  chapters: LawChapter[]
  defaultOpenId?: string
}

export default function LawAccordion({ chapters, defaultOpenId = 'praambel' }: LawAccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set([defaultOpenId]))

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return

    const chapterId = hash.startsWith('kapitel-') ? hash.replace('kapitel-', '') : null
    const chapter =
      (chapterId && chapters.find((entry) => entry.id === chapterId)) ??
      chapters.find((entry) => entry.articles.some((article) => article.id === hash))

    if (!chapter) return

    setOpenIds((prev) => new Set([...prev, chapter.id]))
    window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
  }, [chapters])

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="law-accordion space-y-3">
      {chapters.map((chapter) => {
        const isOpen = openIds.has(chapter.id)
        const hasArticles = chapter.articles.length > 0

        return (
          <section key={chapter.id} id={`kapitel-${chapter.id}`} className="law-chapter card">
            <button
              type="button"
              className="law-chapter-toggle tap-active"
              onClick={() => toggle(chapter.id)}
              aria-expanded={isOpen}
              aria-controls={`kapitel-body-${chapter.id}`}
            >
              <div className="law-chapter-heading">
                <p className="law-chapter-kicker">{chapter.subtitle ?? 'Kapitel'}</p>
                <h2 className="law-chapter-title">{chapter.title}</h2>
              </div>
              <span className={`law-chapter-chevron ${isOpen ? 'law-chapter-chevron--open' : ''}`} aria-hidden>
                ›
              </span>
            </button>

            {isOpen && (
              <div id={`kapitel-body-${chapter.id}`} className="law-chapter-body animate-fade-in">
                {chapter.intro && <p className="law-chapter-intro">{chapter.intro}</p>}

                {hasArticles ? (
                  <div className="law-articles space-y-4">
                    {chapter.articles.map((article) => (
                      <article key={article.id} id={article.id} className="law-article">
                        <p className="law-paragraph">{article.paragraph}</p>
                        <h3 className="law-title">{article.title}</h3>
                        <p className="law-text">{article.text}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  !chapter.intro && <p className="law-text mt-4">Kein weiterer Paragraph in diesem Kapitel.</p>
                )}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
