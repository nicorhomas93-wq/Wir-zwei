import type { AppData, Moodboard, MoodboardItem } from '../types'
import {
  deriveScoresFromApplications,
  EMPTY_PENALTY_SCORES,
  mergePenaltyState,
  processRelationshipMonthDeductions,
} from './penaltyState'

type WithId = { id: string; createdAt: string }

/** Union — lokale Pending-Writes bleiben erhalten */
function mergeByIdUnion<T extends WithId>(remote: T[], local: T[]): T[] {
  const map = new Map<string, T>()
  for (const item of remote) map.set(item.id, item)
  for (const item of local) map.set(item.id, item)
  return [...map.values()]
}

/** Remote-Löschungen übernehmen, lokale Neuanlagen behalten */
function mergeByIdSafe<T extends WithId>(remote: T[], local: T[]): T[] {
  const map = new Map<string, T>()
  for (const item of remote) map.set(item.id, item)
  for (const item of local) {
    if (!map.has(item.id)) map.set(item.id, item)
  }
  return [...map.values()]
}

function normalizeItem(item: MoodboardItem): MoodboardItem {
  return {
    id: item.id,
    createdAt: item.createdAt,
    description: item.description ?? '',
    ...(item.title ? { title: item.title } : {}),
    ...(item.image ? { image: item.image } : {}),
  }
}

export function normalizeMoodboard(board: Moodboard): Moodboard {
  const title = (board.title ?? '').trim()
  return {
    id: board.id,
    title: title || 'Moodboard',
    createdAt: board.createdAt,
    items: (board.items ?? []).map(normalizeItem),
  }
}

function mergeMoodboards(
  remote: AppData['moodboards'],
  local: AppData['moodboards'],
  preferRemote: boolean
): AppData['moodboards'] {
  const mergeItems = preferRemote ? mergeByIdSafe : mergeByIdUnion
  const map = new Map<string, Moodboard>()

  for (const board of remote.map(normalizeMoodboard)) map.set(board.id, board)
  for (const board of local.map(normalizeMoodboard)) {
    const existing = map.get(board.id)
    if (!existing) {
      map.set(board.id, board)
      continue
    }
    map.set(board.id, {
      ...existing,
      ...board,
      title: board.title.trim() || existing.title.trim() || 'Moodboard',
      items: mergeItems(existing.items, board.items).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    })
  }

  return [...map.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

function mergePenalties(
  remote: AppData['penaltyApplications'],
  local: AppData['penaltyApplications'],
  preferRemote: boolean
): AppData['penaltyApplications'] {
  const map = new Map<string, AppData['penaltyApplications'][number]>()
  for (const item of remote) map.set(item.id, item)
  for (const item of local) {
    if (preferRemote) {
      if (!map.has(item.id)) map.set(item.id, item)
    } else {
      map.set(item.id, item)
    }
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
  )
}

function buildPenaltyFields(raw: Partial<AppData>): Pick<
  AppData,
  'penaltyScores' | 'penaltyMeta' | 'penaltyMonthHistory'
> {
  const penaltyApplications = raw.penaltyApplications ?? []
  const penaltyScores = raw.penaltyScores ?? deriveScoresFromApplications(penaltyApplications)

  return {
    penaltyScores: {
      marie: Math.max(0, penaltyScores.marie ?? 0),
      nico: Math.max(0, penaltyScores.nico ?? 0),
    },
    penaltyMeta: raw.penaltyMeta ?? { lastProcessedAnniversary: null },
    penaltyMonthHistory: raw.penaltyMonthHistory ?? [],
  }
}

export function normalizeAppData(raw: Partial<AppData>): AppData {
  const base: AppData = {
    memories: raw.memories ?? [],
    thoughts: raw.thoughts ?? [],
    events: raw.events ?? [],
    moodboards: (raw.moodboards ?? []).map(normalizeMoodboard),
    penaltyApplications: raw.penaltyApplications ?? [],
    ...buildPenaltyFields(raw),
  }

  if (!raw.penaltyScores && base.penaltyScores.marie === 0 && base.penaltyScores.nico === 0) {
    base.penaltyScores = deriveScoresFromApplications(base.penaltyApplications)
  }

  return processRelationshipMonthDeductions(base)
}

export interface MergeOptions {
  /** true = Cloud ist Quelle (Löschungen syncen), false = alles zusammenführen */
  preferRemote?: boolean
}

/** Remote + lokal — überschreibt nie mit leerem Stand */
export function mergeAppData(
  remote: AppData,
  local: AppData,
  options: MergeOptions = {}
): AppData {
  const preferRemote = options.preferRemote ?? false
  const mergeList = preferRemote ? mergeByIdSafe : mergeByIdUnion

  const penaltyApplications = mergePenalties(
    remote.penaltyApplications,
    local.penaltyApplications,
    preferRemote
  )

  const mergedPenalty = mergePenaltyState(
    { ...remote, penaltyApplications },
    { ...local, penaltyApplications }
  )

  const merged: AppData = {
    memories: mergeList(remote.memories, local.memories).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    thoughts: mergeList(remote.thoughts, local.thoughts).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ),
    moodboards: mergeMoodboards(remote.moodboards, local.moodboards, preferRemote),
    events: mergeList(remote.events, local.events).sort((a, b) =>
      a.date.localeCompare(b.date)
    ),
    penaltyApplications,
    ...mergedPenalty,
  }

  return processRelationshipMonthDeductions(merged)
}

/** Firestore lehnt undefined in verschachtelten Objekten ab */
export function sanitizeForFirestore<T>(value: T): T {
  if (value === undefined) return value
  if (value === null) return value
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForFirestore(item)) as T
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (val !== undefined) out[key] = sanitizeForFirestore(val)
    }
    return out as T
  }
  return value
}

export const SYNCED_COLLECTIONS = [
  'memories',
  'thoughts',
  'moodboards',
  'events',
  'penaltyApplications',
  'penaltyScores',
  'penaltyMeta',
  'penaltyMonthHistory',
] as const satisfies readonly (keyof AppData)[]

export { EMPTY_PENALTY_SCORES }
