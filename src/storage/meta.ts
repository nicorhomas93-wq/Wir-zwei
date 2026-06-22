import { toDateKey } from '../utils/calendar'

const META_KEY = 'wir-zwei-meta'

export type SectionKey = 'erinnerungen' | 'gedanken' | 'moodboards' | 'planung'

export interface AppMeta {
  lastSeen: Partial<Record<SectionKey, string>>
  dailyActivity: Record<string, string[]>
}

const emptyMeta = (): AppMeta => ({
  lastSeen: {},
  dailyActivity: {},
})

export function loadMeta(): AppMeta {
  try {
    const raw = localStorage.getItem(META_KEY)
    if (!raw) return emptyMeta()
    const parsed = JSON.parse(raw) as Partial<AppMeta>
    return {
      lastSeen: parsed.lastSeen ?? {},
      dailyActivity: parsed.dailyActivity ?? {},
    }
  } catch {
    return emptyMeta()
  }
}

function saveMeta(meta: AppMeta): void {
  localStorage.setItem(META_KEY, JSON.stringify(meta))
}

export function recordUserActivity(userId: string): void {
  const meta = loadMeta()
  const today = toDateKey(new Date())
  const users = new Set(meta.dailyActivity[today] ?? [])
  users.add(userId)
  meta.dailyActivity[today] = [...users]
  saveMeta(meta)
}

export function markSectionSeen(section: SectionKey): void {
  const meta = loadMeta()
  meta.lastSeen[section] = new Date().toISOString()
  saveMeta(meta)
}

export function bothUsersActiveToday(): boolean {
  const today = toDateKey(new Date())
  const users = loadMeta().dailyActivity[today] ?? []
  return users.includes('marie') && users.includes('nico')
}

export function hasRecentGlobalActivity(withinDays = 3): boolean {
  const meta = loadMeta()
  const cutoff = Date.now() - withinDays * 24 * 60 * 60 * 1000
  return Object.keys(meta.dailyActivity).some((day) => {
    const dayTime = new Date(`${day}T12:00:00`).getTime()
    return dayTime >= cutoff && (meta.dailyActivity[day]?.length ?? 0) > 0
  })
}

interface Timestamped {
  createdAt: string
}

export function hasNewContent(section: SectionKey, items: Timestamped[]): boolean {
  const lastSeen = loadMeta().lastSeen[section]
  if (!lastSeen) return items.length > 0
  const seenTime = new Date(lastSeen).getTime()
  return items.some((item) => new Date(item.createdAt).getTime() > seenTime)
}

export function getNewestTimestamp(items: Timestamped[]): string | undefined {
  if (items.length === 0) return undefined
  return items.reduce((latest, item) =>
    item.createdAt > latest ? item.createdAt : latest
  , items[0].createdAt)
}
