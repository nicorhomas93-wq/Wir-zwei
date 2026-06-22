import type { AppData } from '../types'

const STORAGE_KEY = 'wir-zwei-data'

export const emptyData = (): AppData => ({
  memories: [],
  thoughts: [],
  moodboards: [],
  events: [],
})

export function loadCache(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    const parsed = JSON.parse(raw) as Partial<AppData>
    return {
      memories: parsed.memories ?? [],
      thoughts: parsed.thoughts ?? [],
      moodboards: parsed.moodboards ?? [],
      events: parsed.events ?? [],
    }
  } catch {
    return emptyData()
  }
}

export function saveCache(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function hasAnyData(data: AppData): boolean {
  return (
    data.memories.length > 0 ||
    data.thoughts.length > 0 ||
    data.moodboards.length > 0 ||
    data.events.length > 0
  )
}
