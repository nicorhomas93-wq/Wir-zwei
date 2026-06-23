import { Link } from 'react-router-dom'
import AddButton from '../components/AddButton'
import EnergyBadge from '../components/EnergyBadge'
import NeuBadge from '../components/NeuBadge'
import RelationshipCounter from '../components/RelationshipCounter'
import SectionCardFrame from '../components/SectionCardFrame'
import { useAppData } from '../storage/DataContext'
import { bothUsersActiveToday, hasNewContent, type SectionKey } from '../storage/meta'
import { getEnergyLevel } from '../utils/energy'

const documentSections = [
  {
    to: '/anker',
    title: 'ANKER',
    description: 'Wenn der Kopf laut wird…',
  },
  {
    to: '/beziehungsgesetzbuch',
    title: 'Beziehungsgesetzbuch',
    description: 'Vertrauen, Liebe, Exklusivität',
  },
  {
    to: '/strafkatalog',
    title: 'Strafkatalog',
    description: 'Punkte & Wiedergutmachung',
  },
]

const sections: Array<{
  key: SectionKey
  to: string
  title: string
  description: string
  addLabel: string
  showHearts: boolean
}> = [
  {
    key: 'erinnerungen',
    to: '/erinnerungen',
    title: 'Erinnerungen',
    description: 'Momente, die bleiben',
    addLabel: 'Neue Erinnerung',
    showHearts: true,
  },
  {
    key: 'gedanken',
    to: '/gedanken',
    title: 'Gedanken',
    description: 'Kleine Notizen füreinander',
    addLabel: 'Gedanke schreiben',
    showHearts: true,
  },
  {
    key: 'moodboards',
    to: '/moodboards',
    title: 'Moodboards',
    description: 'Visionen & Träume',
    addLabel: 'Moodboard erstellen',
    showHearts: true,
  },
  {
    key: 'planung',
    to: '/planung',
    title: 'Planung',
    description: 'Gemeinsame Momente voraus',
    addLabel: 'Termin erstellen',
    showHearts: true,
  },
]

export default function Home() {
  const { memories, thoughts, moodboards, events } = useAppData()
  const connected = bothUsersActiveToday()

  const counts: Record<SectionKey, { count: number; items: { createdAt: string }[] }> = {
    erinnerungen: { count: memories.length, items: memories },
    gedanken: { count: thoughts.length, items: thoughts },
    moodboards: { count: moodboards.length, items: moodboards },
    planung: { count: events.length, items: events },
  }

  return (
    <div className="home-screen">
      <RelationshipCounter />

      {documentSections.map((section) => (
        <article key={section.to} className="section-card">
          <Link to={section.to} className="block tap-active">
            <div className="section-card-top">
              <span className="card-diamond" aria-hidden>
                ◇
              </span>
            </div>
            <h2 className="section-card-title">{section.title}</h2>
            <p className="section-card-desc">{section.description}</p>
          </Link>
        </article>
      ))}

      {sections.map((section) => {
        const { count, items } = counts[section.key]
        const energy = getEnergyLevel(count)
        const isNew = hasNewContent(section.key, items)

        return (
          <SectionCardFrame
            key={section.to}
            showHearts={section.showHearts}
            heartPulse={section.showHearts && (isNew || connected)}
            hasNew={isNew}
          >
            <article className={`section-card section-card--${energy}`}>
              <Link to={section.to} className="block tap-active section-card-link">
                <div className="section-card-top">
                  <div className="section-card-title-wrap">
                    <h2 className="section-card-title">{section.title}</h2>
                    {isNew && <NeuBadge />}
                  </div>
                  <EnergyBadge level={energy} />
                </div>
                <p className="section-card-desc">{section.description}</p>
              </Link>

              <AddButton
                variant="card"
                label={section.addLabel}
                to={`${section.to}?new=1`}
              />
            </article>
          </SectionCardFrame>
        )
      })}
    </div>
  )
}
