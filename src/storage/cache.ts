import type { AppData } from '../types'
import { normalizeAppData } from './merge'

const STORAGE_KEY = 'wir-zwei-data'

export const emptyData = (): AppData =>
  normalizeAppData({
    memories: [],
    thoughts: [],
    moodboards: [],
    events: [],
    penaltyApplications: [],
  })

export function loadCache(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    return normalizeAppData(JSON.parse(raw) as Partial<AppData>)
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
    data.events.length > 0 ||
    data.penaltyApplications.length > 0 ||
    data.penaltyScores.marie > 0 ||
    data.penaltyScores.nico > 0
  )
}
