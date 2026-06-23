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

export interface PlanEvent {
  id: string
  userId: string
  userName: string
  title: string
  date: string
  note?: string
  done: boolean
  createdAt: string
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
  penaltyApplications: PenaltyApplication[]
  penaltyScores: PenaltyScores
  penaltyMeta: PenaltyMeta
  penaltyMonthHistory: PenaltyMonthReset[]
}
