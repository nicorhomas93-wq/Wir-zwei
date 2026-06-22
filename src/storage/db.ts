import type { AppData, Memory, Moodboard, MoodboardItem, PlanEvent, Thought } from '../types'
import { recordUserActivity } from './meta'
import { getStore, syncAppData } from './sync'

export function loadData(): AppData {
  return getStore()
}

export function addMemory(memory: Omit<Memory, 'id' | 'createdAt'>): Memory {
  const entry: Memory = {
    ...memory,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  recordUserActivity(memory.userId)
  syncAppData((data) => ({
    ...data,
    memories: [entry, ...data.memories.filter((m) => m.id !== entry.id)],
  }))
  return entry
}

export function getMemories(): Memory[] {
  return getStore().memories
}

export function addThought(thought: Omit<Thought, 'id' | 'createdAt'>): Thought {
  const entry: Thought = {
    ...thought,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  recordUserActivity(thought.userId)
  syncAppData((data) => ({
    ...data,
    thoughts: [...data.thoughts.filter((t) => t.id !== entry.id), entry],
  }))
  return entry
}

export function getThoughts(): Thought[] {
  return getStore().thoughts
}

export function createMoodboard(title: string): Moodboard {
  const cleanTitle = title.trim()
  const board: Moodboard = {
    id: crypto.randomUUID(),
    title: cleanTitle,
    items: [],
    createdAt: new Date().toISOString(),
  }
  syncAppData((data) => ({
    ...data,
    moodboards: [{ ...board, title: cleanTitle }, ...data.moodboards.filter((b) => b.id !== board.id)],
  }))
  return board
}

export function getMoodboards(): Moodboard[] {
  return getStore().moodboards
}

export function getMoodboard(id: string): Moodboard | undefined {
  return getStore().moodboards.find((b) => b.id === id)
}

export function addMoodboardItem(
  boardId: string,
  item: Omit<MoodboardItem, 'id' | 'createdAt'>
): MoodboardItem | undefined {
  const entry: MoodboardItem = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    description: item.description.trim(),
    ...(item.title?.trim() ? { title: item.title.trim() } : {}),
    ...(item.image ? { image: item.image } : {}),
  }

  syncAppData((data) => {
    let boards = data.moodboards.map((board) => ({
      ...board,
      items: board.items ?? [],
    }))

    if (!boards.some((board) => board.id === boardId)) {
      const fallback = getStore().moodboards.find((board) => board.id === boardId)
      if (fallback) {
        boards = [...boards, { ...fallback, items: fallback.items ?? [] }]
      }
    }

    return {
      ...data,
      moodboards: boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              title: (board.title ?? '').trim() || getStore().moodboards.find((b) => b.id === boardId)?.title?.trim() || 'Moodboard',
              items: [entry, ...board.items.filter((i) => i.id !== entry.id)],
            }
          : board
      ),
    }
  })

  return entry
}

export { compressImageFile as readImageAsDataUrl } from '../utils/images'

export function addEvent(event: Omit<PlanEvent, 'id' | 'createdAt' | 'done'>): PlanEvent {
  const entry: PlanEvent = {
    ...event,
    id: crypto.randomUUID(),
    done: false,
    createdAt: new Date().toISOString(),
  }
  recordUserActivity(event.userId)
  syncAppData((data) => ({
    ...data,
    events: [...data.events.filter((e) => e.id !== entry.id), entry],
  }))
  return entry
}

export function getEvents(): PlanEvent[] {
  return [...getStore().events].sort((a, b) => a.date.localeCompare(b.date))
}

export function toggleEventDone(id: string): PlanEvent | undefined {
  const current = getStore().events.find((event) => event.id === id)
  if (!current) return undefined

  const updated = { ...current, done: !current.done }

  syncAppData((data) => ({
    ...data,
    events: data.events.map((event) => (event.id === id ? updated : event)),
  }))

  return updated
}

export function deleteMemory(id: string): void {
  syncAppData((data) => ({
    ...data,
    memories: data.memories.filter((memory) => memory.id !== id),
  }))
}

export function deleteThought(id: string): void {
  syncAppData((data) => ({
    ...data,
    thoughts: data.thoughts.filter((thought) => thought.id !== id),
  }))
}

export function deleteEvent(id: string): void {
  syncAppData((data) => ({
    ...data,
    events: data.events.filter((event) => event.id !== id),
  }))
}

export function deleteMoodboard(id: string): void {
  syncAppData((data) => ({
    ...data,
    moodboards: data.moodboards.filter((board) => board.id !== id),
  }))
}

export function deleteMoodboardItem(boardId: string, itemId: string): void {
  syncAppData((data) => ({
    ...data,
    moodboards: data.moodboards.map((board) =>
      board.id === boardId
        ? { ...board, items: board.items.filter((item) => item.id !== itemId) }
        : board
    ),
  }))
}
