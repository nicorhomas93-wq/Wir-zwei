import type {
  AppData,
  Memory,
  Moodboard,
  MoodboardItem,
  NotificationPreferences,
  PenaltyApplication,
  PlanEvent,
  PushDevice,
  Thought,
} from '../types'
import { POINT_DELTA } from '../content/strafkatalog'
import { sortPlanEvents } from '../utils/planEvents'
import { recordUserActivity } from './meta'
import { normalizeNotifications } from './notificationsState'
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
  return sortPlanEvents(getStore().events)
}

export function updateEvent(
  id: string,
  patch: Partial<
    Pick<
      PlanEvent,
      'title' | 'date' | 'time' | 'note' | 'reminderEnabled' | 'reminderType' | 'reminderTime'
    >
  >
): PlanEvent | undefined {
  const current = getStore().events.find((event) => event.id === id)
  if (!current) return undefined

  const updated: PlanEvent = { ...current, ...patch }

  if ('date' in patch && !patch.date) {
    updated.date = undefined
  }
  if ('time' in patch && !patch.time) {
    updated.time = undefined
  }
  if ('reminderTime' in patch && !patch.reminderTime) {
    updated.reminderTime = undefined
  }

  syncAppData((data) => ({
    ...data,
    events: data.events.map((event) => (event.id === id ? updated : event)),
  }))

  return updated
}

export function markEventReminderShown(id: string): void {
  const now = new Date().toISOString()
  syncAppData((data) => ({
    ...data,
    events: data.events.map((event) =>
      event.id === id ? { ...event, reminderShownAt: now } : event
    ),
  }))
}

export function updateNotificationPreferences(
  patch: Partial<NotificationPreferences>
): NotificationPreferences {
  const current = getStore().notifications
  const updated = normalizeNotifications({ ...current, ...patch })

  syncAppData((data) => ({
    ...data,
    notifications: updated,
  }))

  return updated
}

export function recordAppOpen(): NotificationPreferences {
  const now = new Date().toISOString()
  return updateNotificationPreferences({ lastOpenedAt: now })
}

export function dismissInAppReminder(reminderId: string): void {
  const current = getStore().notifications
  const dismissed = [...new Set([...current.dismissedInAppReminderIds, reminderId])].slice(-40)

  syncAppData((data) => ({
    ...data,
    notifications: { ...data.notifications, dismissedInAppReminderIds: dismissed },
  }))

  if (reminderId.startsWith('daily-')) {
    updateNotificationPreferences({ lastDailyReminderShownAt: new Date().toISOString() })
  } else if (reminderId.startsWith('event:')) {
    const eventId = reminderId.split(':')[1]
    if (eventId) markEventReminderShown(eventId)
  }
}

export function markDailyReminderShown(): void {
  updateNotificationPreferences({ lastDailyReminderShownAt: new Date().toISOString() })
}

export function registerPushDevice(params: {
  userId: string
  token: string
  platform: Exclude<PushDevice['platform'], null>
}): PushDevice {
  const now = new Date().toISOString()
  const existing = getStore().pushDevices.find((device) => device.token === params.token)
  const device: PushDevice = {
    id: existing?.id ?? crypto.randomUUID(),
    userId: params.userId,
    token: params.token,
    platform: params.platform,
    updatedAt: now,
  }

  syncAppData((data) => ({
    ...data,
    pushDevices: [device, ...data.pushDevices.filter((entry) => entry.token !== params.token)],
  }))

  return device
}

export function unregisterPushDevice(token: string): void {
  syncAppData((data) => ({
    ...data,
    pushDevices: data.pushDevices.filter((device) => device.token !== token),
  }))
}

export function addGeneratorPlan(params: {
  userId: string
  userName: string
  title: string
  category: string
  date: string
  reminderEnabled?: boolean
  reminderType?: PlanEvent['reminderType']
}): PlanEvent {
  const prefs = getStore().notifications

  return addEvent({
    userId: params.userId,
    userName: params.userName,
    title: params.title,
    date: params.date,
    category: params.category,
    source: 'generator',
    reminderEnabled: params.reminderEnabled ?? prefs.eventReminderEnabled,
    reminderType: params.reminderType ?? 'day_of',
  })
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

export function applyPenalty(
  penalty: Omit<PenaltyApplication, 'id' | 'appliedAt' | 'points' | 'kind'> & {
    points?: number
    kind?: PenaltyApplication['kind']
  }
): PenaltyApplication {
  const entry: PenaltyApplication = {
    ...penalty,
    kind: penalty.kind ?? 'strafe',
    points: POINT_DELTA,
    id: crypto.randomUUID(),
    appliedAt: new Date().toISOString(),
  }

  recordUserActivity(penalty.appliedByUserId)
  syncAppData((data) => {
    const scores = { ...data.penaltyScores }
    if (penalty.targetUserId === 'marie') scores.marie += POINT_DELTA
    else if (penalty.targetUserId === 'nico') scores.nico += POINT_DELTA

    return {
      ...data,
      penaltyScores: scores,
      penaltyApplications: [entry, ...data.penaltyApplications.filter((item) => item.id !== entry.id)],
    }
  })

  return entry
}

/** Wiedergutmachung aus dem Katalog — immer −1, nie unter 0. */
export function applyRedemption(
  params: Omit<PenaltyApplication, 'id' | 'appliedAt' | 'points' | 'kind'>
): PenaltyApplication | null {
  const store = getStore()
  const current =
    params.targetUserId === 'marie' ? store.penaltyScores.marie : store.penaltyScores.nico
  if (current <= 0) return null

  const entry: PenaltyApplication = {
    ...params,
    kind: 'wiedergutmachung',
    points: -POINT_DELTA,
    id: crypto.randomUUID(),
    appliedAt: new Date().toISOString(),
  }

  recordUserActivity(params.appliedByUserId)
  syncAppData((data) => {
    const scores = { ...data.penaltyScores }
    if (params.targetUserId === 'marie') scores.marie = Math.max(0, scores.marie - POINT_DELTA)
    else if (params.targetUserId === 'nico') scores.nico = Math.max(0, scores.nico - POINT_DELTA)

    return {
      ...data,
      penaltyScores: scores,
      penaltyApplications: [entry, ...data.penaltyApplications.filter((item) => item.id !== entry.id)],
    }
  })

  return entry
}

/** +1 Punkt manuell vergeben (ohne konkrete Strafe aus dem Katalog). */
export function grantManualPenaltyPoint(params: {
  targetUserId: string
  targetUserName: string
  appliedByUserId: string
  appliedByUserName: string
  note?: string
}): PenaltyApplication {
  return applyPenalty({
    penaltyId: 'manual-grant',
    kind: 'manuell',
    title: params.note?.trim() || 'Manuell vergeben',
    targetUserId: params.targetUserId,
    targetUserName: params.targetUserName,
    appliedByUserId: params.appliedByUserId,
    appliedByUserName: params.appliedByUserName,
  })
}

/** −1 Punkt manuell abbauen — nie unter 0. */
export function deductManualPenaltyPoint(params: {
  targetUserId: string
  targetUserName: string
  appliedByUserId: string
  appliedByUserName: string
  note?: string
}): PenaltyApplication | null {
  return applyRedemption({
    penaltyId: 'manual-deduct',
    title: params.note?.trim() || 'Manuell abgebaut',
    targetUserId: params.targetUserId,
    targetUserName: params.targetUserName,
    appliedByUserId: params.appliedByUserId,
    appliedByUserName: params.appliedByUserName,
  })
}

export function getPenaltyApplications(): PenaltyApplication[] {
  return getStore().penaltyApplications
}

export function getPenaltyScores(): AppData['penaltyScores'] {
  return getStore().penaltyScores
}
