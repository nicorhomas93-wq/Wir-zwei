export interface User {
  id: string
  name: string
}

export interface Memory {
  id: string
  userId: string
  userName: string
  text: string
  image?: string
  createdAt: string
}

export interface Thought {
  id: string
  userId: string
  userName: string
  text: string
  createdAt: string
}

export interface MoodboardItem {
  id: string
  image?: string
  title?: string
  description: string
  createdAt: string
}

export interface Moodboard {
  id: string
  title: string
  items: MoodboardItem[]
  createdAt: string
}

export type PlanEventSource = 'generator' | 'manual'

export type EventReminderType = 'day_of' | 'one_hour_before' | 'custom' | 'none'

export type PushPermission = 'default' | 'granted' | 'denied'

export type PushPlatform = 'android' | 'ios' | 'web' | null

export interface PlanEvent {
  id: string
  userId: string
  userName: string
  title: string
  date?: string
  time?: string
  note?: string
  done: boolean
  createdAt: string
  source?: PlanEventSource
  category?: string
  reminderEnabled?: boolean
  reminderType?: EventReminderType
  reminderTime?: string
  reminderShownAt?: string
  /** Dedup-Schlüssel für serverseitige Push-Erinnerungen */
  pushReminderSentKey?: string
}

export interface PushDevice {
  id: string
  userId: string
  token: string
  platform: Exclude<PushPlatform, null>
  updatedAt: string
}

export interface NotificationPreferences {
  dailyReminderEnabled: boolean
  dailyReminderTime: string
  eventReminderEnabled: boolean
  pushEnabled: boolean
  pushPermission: PushPermission
  pushPlatform: PushPlatform
  pushSubscriptionToken: string | null
  lastOpenedAt: string | null
  lastDailyReminderShownAt: string | null
  lastDailyPushSentAt: string | null
  dismissedInAppReminderIds: string[]
}

export type PenaltyEntryKind = 'strafe' | 'wiedergutmachung' | 'monatsabzug' | 'manuell'

export interface PenaltyApplication {
  id: string
  penaltyId: string
  title: string
  points: number
  kind: PenaltyEntryKind
  targetUserId: string
  targetUserName: string
  appliedByUserId: string
  appliedByUserName: string
  appliedAt: string
}

export interface PenaltyScores {
  marie: number
  nico: number
}

export interface PenaltyMeta {
  lastProcessedAnniversary: string | null
}

export interface PenaltyMonthReset {
  id: string
  anniversaryDate: string
  scoresBefore: PenaltyScores
  scoresAfter: PenaltyScores
  processedAt: string
}

export interface AppData {
  memories: Memory[]
  thoughts: Thought[]
  moodboards: Moodboard[]
  events: PlanEvent[]
  notifications: NotificationPreferences
  pushDevices: PushDevice[]
  penaltyApplications: PenaltyApplication[]
  penaltyScores: PenaltyScores
  penaltyMeta: PenaltyMeta
  penaltyMonthHistory: PenaltyMonthReset[]
}
