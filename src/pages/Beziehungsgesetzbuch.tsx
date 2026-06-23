import { Link } from 'react-router-dom'
import {
  BEZIEHUNGSGESETZBUCH,
  BEZIEHUNGSGESETZE,
  PDF_INHALTSVERZEICHNIS,
} from '../content/beziehungsgesetzbuch'
import LawAccordion from '../components/LawAccordion'

export default function Beziehungsgesetzbuch() {
  return (
    <div className="document-page space-y-8 pb-16">
      <div>
        <Link to="/" className="text-sm nav-back tap-active">
          ← Home
        </Link>
        <p className="document-kicker mt-4">Beziehungsgesetzbuch</p>
        <h1 className="document-title">Euer Rahmen.</h1>
        <p className="document-subtitle">Vertrauen, Liebe, Exklusivität — lebenslang.</p>
      </div>

      <section className="document-block animate-fade-in">
        <p className="document-label">Inhaltsverzeichnis (PDF)</p>
        <ul className="document-toc">
          {PDF_INHALTSVERZEICHNIS.map((entry) => (
            <li key={entry.paragraph}>
              <a href={`#${BEZIEHUNGSGESETZE.find((law) => law.paragraph === entry.paragraph)?.id ?? ''}`} className="document-toc-link tap-active">
                {entry.paragraph} – {entry.title}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="document-block animate-fade-in">
        <p className="document-label">Kapitel</p>
        <ul className="document-toc">
          {BEZIEHUNGSGESETZBUCH.map((chapter) => (
            <li key={chapter.id}>
              <a href={`#kapitel-${chapter.id}`} className="document-toc-link tap-active">
                {chapter.title}
              </a>
              {chapter.articles.length > 0 && (
                <ul className="document-toc-sub">
                  {chapter.articles.map((article) => (
                    <li key={article.id}>
                      {article.paragraph} – {article.title}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>

      <LawAccordion chapters={BEZIEHUNGSGESETZBUCH} />

      <Link to="/strafkatalog" className="document-link-card card tap-active animate-fade-in">
        <p className="document-label mb-2">Separater Bereich</p>
        <h2 className="law-title">Strafkatalog</h2>
        <p className="law-text mt-1">
          Interaktive Strafen, Punkte und Beziehungsmonat — nicht Teil des Gesetzbuchs.
        </p>
        <p className="document-link-arrow mt-3">Zum Strafkatalog →</p>
      </Link>

      <section className="document-signatures animate-fade-in">
        <p>Unterschrift Marie Paufler: __________</p>
        <p>Unterschrift Nico Thomas: __________</p>
      </section>
    </div>
  )
}
