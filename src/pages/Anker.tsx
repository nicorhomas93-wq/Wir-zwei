import { Link } from 'react-router-dom'
import { ANKER_SECTIONS } from '../content/anker'

export default function Anker() {
  return (
    <div className="document-page space-y-10 pb-16">
      <div>
        <Link to="/" className="text-sm nav-back tap-active">
          ← Home
        </Link>
        <p className="document-kicker mt-4">ANKER</p>
        <h1 className="document-title">Du bist sicher.</h1>
      </div>

      {ANKER_SECTIONS.map((section) => (
        <section key={section.id} className="document-block animate-fade-in">
          <p className="document-label">{section.label}</p>

          {'lines' in section && (
            <div className="document-lines">
              {section.lines.map((line) => (
                <p key={line} className="document-line">
                  {line}
                </p>
              ))}
            </div>
          )}

          {'steps' in section && (
            <div className="document-steps">
              {section.intro && <p className="document-intro">{section.intro}</p>}
              {section.steps.map((step) => (
                <div key={step.title} className="document-step">
                  <p className="document-step-title">{step.title}</p>
                  {step.lines.map((line) => (
                    <p key={line} className="document-line">
                      {line}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
