import { Link } from 'react-router-dom'
import { BEZIEHUNGSGESETZE, STRAFENKATALOG } from '../content/beziehungsgesetzbuch'

export default function Beziehungsgesetzbuch() {
  return (
    <div className="document-page space-y-10 pb-16">
      <div>
        <Link to="/" className="text-sm nav-back tap-active">
          ← Home
        </Link>
        <p className="document-kicker mt-4">Beziehungsgesetzbuch</p>
        <h1 className="document-title">Euer Rahmen.</h1>
        <p className="document-subtitle">Vertrauen, Liebe, Exklusivität — lebenslang.</p>
      </div>

      <section className="document-block animate-fade-in">
        <p className="document-label">Inhaltsverzeichnis</p>
        <ul className="document-toc">
          {BEZIEHUNGSGESETZE.map((law) => (
            <li key={law.paragraph}>
              {law.paragraph} – {law.title}
            </li>
          ))}
          <li>Strafenkatalog</li>
        </ul>
      </section>

      <section className="space-y-5">
        {BEZIEHUNGSGESETZE.map((law) => (
          <article key={law.paragraph} className="law-card card animate-fade-in">
            <p className="law-paragraph">{law.paragraph}</p>
            <h2 className="law-title">{law.title}</h2>
            <p className="law-text">{law.text}</p>
          </article>
        ))}
      </section>

      <section className="document-block animate-fade-in">
        <p className="document-label">Strafenkatalog</p>
        <div className="space-y-3">
          {STRAFENKATALOG.map((entry) => (
            <div key={entry.paragraph} className="law-card card">
              <p className="law-paragraph">{entry.paragraph}</p>
              <p className="law-text">{entry.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="document-signatures animate-fade-in">
        <p>Unterschrift Marie Paufler: __________</p>
        <p>Unterschrift Nico Thomas: __________</p>
      </section>
    </div>
  )
}
