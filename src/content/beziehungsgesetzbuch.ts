import { RELATIONSHIP_START_LABEL } from '../constants/relationship'

export interface LawArticle {
  id: string
  paragraph: string
  title: string
  text: string
}

export interface LawChapter {
  id: string
  title: string
  subtitle?: string
  intro?: string
  articles: LawArticle[]
}

/**
 * Inhalt 1:1 aus Beziehungsgesetzbuch_FINAL_RAHMEN.PDF —
 * in Kapitel gegliedert, ohne erfundene Paragraphen.
 */
export const BEZIEHUNGSGESETZBUCH: LawChapter[] = [
  {
    id: 'praambel',
    title: 'Präambel',
    subtitle: 'Geltung & Rahmen',
    intro:
      'Beziehungsgesetzbuch von Marie Paufler und Nico Thomas. Gültig ab ' +
      RELATIONSHIP_START_LABEL +
      '. Dieses Dokument ist euer gemeinsamer Rahmen — ruhig, verbindlich, nur für euch zwei.',
    articles: [],
  },
  {
    id: 'vertrauen',
    title: 'Vertrauen',
    subtitle: '§1 – Grundsatz',
    articles: [
      {
        id: 'p1',
        paragraph: '§1',
        title: 'Grundsatz',
        text: 'Diese Beziehung basiert auf Vertrauen, Respekt und unendlicher Liebe.',
      },
    ],
  },
  {
    id: 'kommunikation',
    title: 'Kommunikation',
    subtitle: '§2 – Liebespflicht',
    articles: [
      {
        id: 'p2',
        paragraph: '§2',
        title: 'Liebespflicht',
        text: 'Regelmäßige Liebesbekundungen sind verpflichtend.',
      },
    ],
  },
  {
    id: 'loyalitaet',
    title: 'Loyalität & Exklusivität',
    subtitle: '§3 – Exklusivität',
    articles: [
      {
        id: 'p3',
        paragraph: '§3',
        title: 'Exklusivität',
        text: 'Beide Parteien gehören ausschließlich zueinander.',
      },
    ],
  },
  {
    id: 'streitregeln',
    title: 'Streitregeln',
    subtitle: 'Ruhe bewahren',
    intro:
      'Im Gesetzbuch stehen keine eigenen Streit-Paragraphen — stattdessen gilt: Konflikte werden respektvoll geführt. Der ANKER-Bereich in dieser App ist euer verbindlicher Rückzugsort, wenn es laut wird.',
    articles: [],
  },
  {
    id: 'schutz',
    title: 'Schutz & Sicherheit',
    subtitle: 'Du bist sicher',
    intro:
      'Emotionale Sicherheit ist Teil eures Rahmens. Wenn Unruhe entsteht, beginnt ihr beim ANKER — nicht mit Vorwürfen, sondern mit Halt.',
    articles: [],
  },
  {
    id: 'versprechen',
    title: 'Versprechen & Werte',
    subtitle: '§4 & §5',
    articles: [
      {
        id: 'p4',
        paragraph: '§4',
        title: 'Kündigung',
        text: 'Kündigung ausgeschlossen. Widerruf nicht möglich.',
      },
      {
        id: 'p5',
        paragraph: '§5',
        title: 'Laufzeit',
        text: 'Lebenslang mit automatischer Verlängerung ins Unendliche.',
      },
    ],
  },
]

/** PDF-Inhaltsverzeichnis (§1–§5) */
export const PDF_INHALTSVERZEICHNIS = [
  { paragraph: '§1', title: 'Grundsatz' },
  { paragraph: '§2', title: 'Liebespflicht' },
  { paragraph: '§3', title: 'Exklusivität' },
  { paragraph: '§4', title: 'Kündigung' },
  { paragraph: '§5', title: 'Laufzeit' },
] as const

export const BEZIEHUNGSGESETZE = BEZIEHUNGSGESETZBUCH.flatMap((chapter) =>
  chapter.articles.map((article) => ({
    id: article.id,
    paragraph: article.paragraph,
    title: article.title,
    chapterId: chapter.id,
    chapterTitle: chapter.title,
  }))
)
