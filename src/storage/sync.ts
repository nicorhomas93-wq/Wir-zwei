import {
  doc,
  onSnapshot,
  runTransaction,
  setDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'
import type { AppData } from '../types'
import { hasAnyData, loadCache, saveCache } from './cache'
import { mergeAppData, normalizeAppData, sanitizeForFirestore } from './merge'
import { normalizeNotifications } from './notificationsState'
import { BOARDS_DOC_PATH, MAIN_DOC_PATH } from './paths'

type Listener = () => void
type Mutator = (data: AppData) => AppData

let store: AppData = loadCache()
const listeners = new Set<Listener>()
const unsubscribers: Unsubscribe[] = []
let syncStarted = false
const retryQueue: Mutator[] = []
let flushing = false

let remoteMain: Pick<
  AppData,
  | 'memories'
  | 'thoughts'
  | 'events'
  | 'notifications'
  | 'pushDevices'
  | 'penaltyApplications'
  | 'penaltyScores'
  | 'penaltyMeta'
  | 'penaltyMonthHistory'
> = {
  memories: [],
  thoughts: [],
  events: [],
  notifications: normalizeNotifications(),
  pushDevices: [],
  penaltyApplications: [],
  penaltyScores: { marie: 0, nico: 0 },
  penaltyMeta: { lastProcessedAnniversary: null },
  penaltyMonthHistory: [],
}
let remoteMoodboards: AppData['moodboards'] = []
let mainReady = false
let boardsReady = false

function notify(): void {
  listeners.forEach((listener) => listener())
}

export function getStore(): AppData {
  return store
}

export function setStore(data: AppData): void {
  store = normalizeAppData(data)
  saveCache(store)
  notify()
}

export function subscribeStore(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getMainRef() {
  if (!db) throw new Error('Firestore not configured')
  return doc(db, MAIN_DOC_PATH[0], MAIN_DOC_PATH[1])
}

function getBoardsRef() {
  if (!db) throw new Error('Firestore not configured')
  return doc(db, BOARDS_DOC_PATH[0], BOARDS_DOC_PATH[1])
}

function combineRemote(): AppData {
  return normalizeAppData({
    ...remoteMain,
    moodboards: remoteMoodboards,
  })
}

function readRemoteFromSnaps(
  mainData: Record<string, unknown> | undefined,
  boardsData: Record<string, unknown> | undefined
): AppData {
  return normalizeAppData({
    ...(mainData ?? {}),
    moodboards: boardsData?.moodboards
      ? (boardsData.moodboards as AppData['moodboards'])
      : mainData?.moodboards
        ? (mainData.moodboards as AppData['moodboards'])
        : [],
  })
}

function applyRemoteSnapshot(): void {
  if (!mainReady || !boardsReady) return

  const remote = combineRemote()
  const local = getStore()
  const remoteHasData = hasAnyData(remote)
  const localHasData = hasAnyData(local)
  const pendingWrites = retryQueue.length > 0 || flushing

  // Cloud noch leer, lokal schon Inhalt → nichts überschreiben, hochladen
  if (!remoteHasData && localHasData) {
    setStore(local)
    if (!pendingWrites) void seedRemoteIfNeeded(local)
    return
  }

  const preferRemote = !pendingWrites && remoteHasData
  setStore(mergeAppData(remote, local, { preferRemote }))
}

function splitForCloud(data: AppData) {
  return {
    main: sanitizeForFirestore({
      memories: data.memories,
      thoughts: data.thoughts,
      events: data.events,
      notifications: data.notifications,
      pushDevices: data.pushDevices,
      penaltyApplications: data.penaltyApplications,
      penaltyScores: data.penaltyScores,
      penaltyMeta: data.penaltyMeta,
      penaltyMonthHistory: data.penaltyMonthHistory,
    }),
    moodboards: sanitizeForFirestore({
      moodboards: data.moodboards,
    }),
  }
}

async function seedRemoteIfNeeded(cached: AppData): Promise<void> {
  if (!db || !hasAnyData(cached)) return

  try {
    await runTransaction(db, async (transaction) => {
      const mainSnap = await transaction.get(getMainRef())
      const boardsSnap = await transaction.get(getBoardsRef())
      const current = readRemoteFromSnaps(
        mainSnap.exists() ? mainSnap.data() : undefined,
        boardsSnap.exists() ? boardsSnap.data() : undefined
      )

      if (hasAnyData(current)) return

      const payload = splitForCloud(cached)
      transaction.set(getMainRef(), payload.main)
      transaction.set(getBoardsRef(), payload.moodboards)
    })
  } catch (error) {
    console.warn('[Wir Zwei] Seed fehlgeschlagen — lokale Daten bleiben erhalten.', error)
  }
}

async function migrateLegacyMoodboards(
  legacyBoards: AppData['moodboards']
): Promise<void> {
  if (!db || legacyBoards.length === 0) return

  try {
    await runTransaction(db, async (transaction) => {
      const boardsSnap = await transaction.get(getBoardsRef())
      const existing = boardsSnap.exists()
        ? ((boardsSnap.data().moodboards as AppData['moodboards']) ?? [])
        : []

      if (existing.length > 0) return

      transaction.set(
        getBoardsRef(),
        sanitizeForFirestore({ moodboards: legacyBoards })
      )
    })
  } catch (error) {
    console.warn('[Wir Zwei] Moodboard-Migration fehlgeschlagen.', error)
  }
}

function applyQueuedMutators(base: AppData, mutators: Mutator[]): AppData {
  const mergedBase = mergeAppData(base, getStore())
  return mutators.reduce((data, mutate) => mutate(data), mergedBase)
}

async function flushWriteQueue(): Promise<void> {
  if (flushing || retryQueue.length === 0 || !db) return
  flushing = true

  const batchMutators = [...retryQueue]

  try {
    const next = await runTransaction(db, async (transaction) => {
      const mainSnap = await transaction.get(getMainRef())
      const boardsSnap = await transaction.get(getBoardsRef())

      const current = readRemoteFromSnaps(
        mainSnap.exists() ? mainSnap.data() : undefined,
        boardsSnap.exists() ? boardsSnap.data() : undefined
      )

      const updated = applyQueuedMutators(current, batchMutators)
      const payload = splitForCloud(updated)

      transaction.set(getMainRef(), payload.main)
      transaction.set(getBoardsRef(), payload.moodboards)

      return updated
    })

    for (const mutate of batchMutators) {
      const index = retryQueue.indexOf(mutate)
      if (index >= 0) retryQueue.splice(index, 1)
    }

    setStore(mergeAppData(next, getStore()))
  } catch (error) {
    console.warn('[Wir Zwei] Cloud-Speichern fehlgeschlagen — lokale Kopie bleibt.', error)
    window.setTimeout(() => void flushWriteQueue(), 4000)
  } finally {
    flushing = false
    if (retryQueue.length > 0) void flushWriteQueue()
  }
}

export function startFirebaseSync(): () => void {
  if (syncStarted) return () => undefined
  syncStarted = true

  if (!isFirebaseConfigured || !db) {
    console.warn('[Wir Zwei] Firebase nicht konfiguriert — nur lokaler Cache aktiv.')
    return () => undefined
  }

  const cached = loadCache()
  let seeded = false

  const mainUnsub = onSnapshot(
    getMainRef(),
    (snapshot) => {
      if (!snapshot.exists()) {
        if (!seeded && hasAnyData(cached)) {
          seeded = true
          void seedRemoteIfNeeded(cached)
        } else if (!seeded && !hasAnyData(cached)) {
          seeded = true
          const batch = writeBatch(db!)
          batch.set(
            getMainRef(),
            sanitizeForFirestore({
              memories: [],
              thoughts: [],
              events: [],
              notifications: normalizeNotifications(),
              pushDevices: [],
              penaltyApplications: [],
              penaltyScores: { marie: 0, nico: 0 },
              penaltyMeta: { lastProcessedAnniversary: null },
              penaltyMonthHistory: [],
            })
          )
          void batch.commit()
        }
        mainReady = true
        applyRemoteSnapshot()
        return
      }

      const data = snapshot.data()
      remoteMain = {
        memories: (data.memories as AppData['memories']) ?? [],
        thoughts: (data.thoughts as AppData['thoughts']) ?? [],
        events: (data.events as AppData['events']) ?? [],
        notifications: normalizeNotifications(
          data.notifications as Partial<AppData['notifications']> | undefined
        ),
        pushDevices: (data.pushDevices as AppData['pushDevices']) ?? [],
        penaltyApplications: (data.penaltyApplications as AppData['penaltyApplications']) ?? [],
        penaltyScores: (data.penaltyScores as AppData['penaltyScores']) ?? { marie: 0, nico: 0 },
        penaltyMeta: (data.penaltyMeta as AppData['penaltyMeta']) ?? {
          lastProcessedAnniversary: null,
        },
        penaltyMonthHistory: (data.penaltyMonthHistory as AppData['penaltyMonthHistory']) ?? [],
      }

      const legacyBoards = (data.moodboards as AppData['moodboards']) ?? []
      if (legacyBoards.length > 0 && remoteMoodboards.length === 0) {
        remoteMoodboards = legacyBoards.map((board) => ({
          ...board,
          items: board.items ?? [],
        }))
        void migrateLegacyMoodboards(remoteMoodboards)
      }

      mainReady = true
      applyRemoteSnapshot()
    },
    (error) => {
      console.warn('[Wir Zwei] Main-Sync offline — lokaler Cache bleibt aktiv.', error)
    }
  )

  const boardsUnsub = onSnapshot(
    getBoardsRef(),
    (snapshot) => {
      if (!snapshot.exists()) {
        if (cached.moodboards.length > 0 && retryQueue.length === 0) {
          void setDoc(
            getBoardsRef(),
            sanitizeForFirestore({ moodboards: cached.moodboards })
          )
        }
        boardsReady = true
        applyRemoteSnapshot()
        return
      }

      remoteMoodboards =
        (snapshot.data().moodboards as AppData['moodboards']) ?? []
      boardsReady = true
      applyRemoteSnapshot()
    },
    (error) => {
      console.warn('[Wir Zwei] Moodboard-Sync offline — lokaler Cache bleibt aktiv.', error)
    }
  )

  unsubscribers.push(mainUnsub, boardsUnsub)

  return () => {
    unsubscribers.forEach((unsub) => unsub())
    unsubscribers.length = 0
    syncStarted = false
    mainReady = false
    boardsReady = false
  }
}

/** Alle Datentypen über diese Funktion speichern → Cloud + Cache + Live-Sync */
export function syncAppData(mutate: Mutator): AppData {
  const optimistic = mutate(getStore())
  setStore(optimistic)

  if (!isFirebaseConfigured || !db) {
    return optimistic
  }

  retryQueue.push(mutate)
  void flushWriteQueue()
  return optimistic
}

export async function persistMutation(mutate: Mutator): Promise<AppData> {
  return syncAppData(mutate)
}
