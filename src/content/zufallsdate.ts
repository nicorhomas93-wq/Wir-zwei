export type ActivityCategory = 'alltag' | 'dates' | 'liebe'

export type ActivityFilter = 'all' | ActivityCategory

export type ActivityVibe = 'ruhig' | 'draussen' | 'spontan' | 'zuhause'

export interface ActivityCategoryMeta {
  id: ActivityCategory
  label: string
  hint: string
}

export interface ActivityVibeMeta {
  id: ActivityVibe
  label: string
}

export interface ActivityEntry {
  text: string
  vibes: ActivityVibe[]
}

export interface ZufallsdateQuery {
  category: ActivityFilter
  vibes: ActivityVibe[]
}

export interface RandomActivityResult {
  category: ActivityCategory
  text: string
}

export const ACTIVITY_CATEGORIES: Record<ActivityCategory, ActivityCategoryMeta> = {
  alltag: {
    id: 'alltag',
    label: 'Alltag',
    hint: 'Einfach & spontan',
  },
  dates: {
    id: 'dates',
    label: 'Dates',
    hint: 'Gemeinsame Erlebnisse',
  },
  liebe: {
    id: 'liebe',
    label: 'Liebe',
    hint: 'Nähe & Verbindung',
  },
}

export const ACTIVITY_VIBES: ActivityVibeMeta[] = [
  { id: 'ruhig', label: 'Ruhig' },
  { id: 'draussen', label: 'Draußen' },
  { id: 'spontan', label: 'Spontan' },
  { id: 'zuhause', label: 'Zuhause' },
]

function a(text: string, vibes: ActivityVibe[]): ActivityEntry {
  return { text, vibes }
}

export const ACTIVITIES: Record<ActivityCategory, readonly ActivityEntry[]> = {
  alltag: [
    a('Spazieren gehen ohne Ziel', ['draussen', 'spontan', 'ruhig']),
    a('Zusammen einkaufen + 1 unnötige Sache holen', ['draussen', 'spontan']),
    a('Kaffee holen und irgendwo hinsetzen', ['draussen', 'spontan', 'ruhig']),
    a('30 Minuten nur reden – ohne Handy', ['ruhig', 'zuhause']),
    a('Zusammen kochen (egal was)', ['zuhause', 'spontan']),
    a('Einen neuen Spazierweg ausprobieren', ['draussen', 'spontan']),
    a('Gemeinsam aufräumen – mit Musik', ['zuhause', 'spontan']),
    a('Einen kurzen Ausflug in die nächste Nachbarschaft', ['draussen', 'spontan']),
    a('Etwas backen, das ihr noch nie probiert habt', ['zuhause', 'spontan']),
    a('Abends die Lichter dimmen und einfach da sein', ['zuhause', 'ruhig']),
  ],
  dates: [
    a('Kinoabend – Genre: Zufall', ['draussen', 'spontan']),
    a('Restaurant ausprobieren', ['draussen', 'spontan']),
    a('Nachtfahrt ohne Ziel', ['draussen', 'spontan']),
    a('Spaziergang + Deep Talk', ['draussen', 'ruhig']),
    a('Heute entscheidet dein Partner alles', ['spontan']),
    a('Picknick – auch wenn es drinnen ist', ['draussen', 'ruhig', 'spontan']),
    a('Einen Ort besuchen, den ihr noch nie wart', ['draussen', 'spontan']),
    a('Spieleabend zu zweit', ['zuhause', 'ruhig']),
    a('Sonnenuntergang irgendwo suchen', ['draussen', 'ruhig']),
    a('Einen halben Tag wie Touristen in eurer Stadt', ['draussen', 'spontan']),
  ],
  liebe: [
    a('10 Minuten einfach nur umarmen', ['zuhause', 'ruhig']),
    a('Sag deinem Partner eine Sache, die du selten aussprichst', ['ruhig', 'zuhause']),
    a('Blickkontakt für 1 Minute halten', ['ruhig', 'zuhause']),
    a('Kleine Überraschung planen', ['spontan', 'zuhause']),
    a('Bewusst 15 Minuten Nähe ohne Ablenkung', ['ruhig', 'zuhause']),
    a('Schreibt euch kurz auf, was ihr aneinander schätzt', ['ruhig', 'zuhause']),
    a('Gemeinsam eine Playlist für heute Abend bauen', ['zuhause', 'spontan']),
    a('Eine Erinnerung teilen, die ihr selten erwähnt', ['ruhig']),
    a('Hand in Hand – auch wenn ihr nur zu Hause seid', ['zuhause', 'ruhig']),
    a('Einem Partner heute bewusst zuhören, ohne zu unterbrechen', ['ruhig', 'zuhause']),
  ],
}

function pickFrom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function categoryPool(filter: ActivityFilter): RandomActivityResult[] {
  if (filter === 'all') {
    return (Object.keys(ACTIVITIES) as ActivityCategory[]).flatMap((category) =>
      ACTIVITIES[category].map((entry) => ({ category, text: entry.text }))
    )
  }

  return ACTIVITIES[filter].map((entry) => ({ category: filter, text: entry.text }))
}

function matchesVibes(entry: ActivityEntry, vibes: ActivityVibe[]): boolean {
  if (vibes.length === 0) return true
  return vibes.some((vibe) => entry.vibes.includes(vibe))
}

export function poolForQuery(query: ZufallsdateQuery): RandomActivityResult[] {
  const categories =
    query.category === 'all'
      ? (Object.keys(ACTIVITIES) as ActivityCategory[])
      : [query.category]

  const pool = categories.flatMap((category) =>
    ACTIVITIES[category]
      .filter((entry) => matchesVibes(entry, query.vibes))
      .map((entry) => ({ category, text: entry.text }))
  )

  if (pool.length > 0) return pool

  return categoryPool(query.category)
}

export function pickRandomActivity(
  query: ZufallsdateQuery,
  exclude?: RandomActivityResult | null
): RandomActivityResult {
  const pool = poolForQuery(query)

  if (pool.length === 0) {
    return { category: 'alltag', text: 'Einfach zusammen sein.' }
  }

  if (pool.length === 1) return pool[0]

  if (!exclude) return pickFrom(pool)

  const filtered = pool.filter(
    (item) => item.text !== exclude.text || item.category !== exclude.category
  )

  return pickFrom(filtered.length > 0 ? filtered : pool)
}

export function pickShufflePreviews(
  query: ZufallsdateQuery,
  final: RandomActivityResult,
  count: number
): string[] {
  const pool = poolForQuery(query)
  let candidates = pool.map((item) => item.text).filter((text) => text !== final.text)

  if (candidates.length === 0) {
    candidates = pool.map((item) => item.text)
  }

  const shuffled = [...candidates]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  const picks: string[] = []
  for (let i = 0; i < count; i += 1) {
    picks.push(shuffled[i % shuffled.length])
  }

  return picks
}
