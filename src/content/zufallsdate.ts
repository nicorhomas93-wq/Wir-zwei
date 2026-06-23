export type ActivityCategory = 'alltag' | 'dates' | 'liebe'

export type ActivityFilter = 'all' | ActivityCategory

export interface ActivityCategoryMeta {
  id: ActivityCategory
  label: string
  hint: string
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

export const ACTIVITIES: Record<ActivityCategory, readonly string[]> = {
  alltag: [
    'Spazieren gehen ohne Ziel',
    'Zusammen einkaufen + 1 unnötige Sache holen',
    'Kaffee holen und irgendwo hinsetzen',
    '30 Minuten nur reden – ohne Handy',
    'Zusammen kochen (egal was)',
    'Einen neuen Spazierweg ausprobieren',
    'Gemeinsam aufräumen – mit Musik',
    'Einen kurzen Ausflug in die nächste Nachbarschaft',
    'Etwas backen, das ihr noch nie probiert habt',
    'Abends die Lichter dimmen und einfach da sein',
  ],
  dates: [
    'Kinoabend – Genre: Zufall',
    'Restaurant ausprobieren',
    'Nachtfahrt ohne Ziel',
    'Spaziergang + Deep Talk',
    'Heute entscheidet dein Partner alles',
    'Picknick – auch wenn es drinnen ist',
    'Einen Ort besuchen, den ihr noch nie wart',
    'Spieleabend zu zweit',
    'Sonnenuntergang irgendwo suchen',
    'Einen halben Tag wie Touristen in eurer Stadt',
  ],
  liebe: [
    '10 Minuten einfach nur umarmen',
    'Sag deinem Partner eine Sache, die du selten aussprichst',
    'Blickkontakt für 1 Minute halten',
    'Kleine Überraschung planen',
    'Bewusst 15 Minuten Nähe ohne Ablenkung',
    'Schreibt euch kurz auf, was ihr aneinander schätzt',
    'Gemeinsam eine Playlist für heute Abend bauen',
    'Eine Erinnerung teilen, die ihr selten erwähnt',
    'Hand in Hand – auch wenn ihr nur zu Hause seid',
    'Einem Partner heute bewusst zuhören, ohne zu unterbrechen',
  ],
}

export interface RandomActivityResult {
  category: ActivityCategory
  text: string
}

function pickFrom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function poolForFilter(filter: ActivityFilter): RandomActivityResult[] {
  if (filter === 'all') {
    return (Object.keys(ACTIVITIES) as ActivityCategory[]).flatMap((category) =>
      ACTIVITIES[category].map((text) => ({ category, text }))
    )
  }

  return ACTIVITIES[filter].map((text) => ({ category: filter, text }))
}

export function pickRandomActivity(
  filter: ActivityFilter,
  exclude?: RandomActivityResult | null
): RandomActivityResult {
  const pool = poolForFilter(filter)

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
