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

export interface AppData {
  memories: Memory[]
  thoughts: Thought[]
  moodboards: Moodboard[]
  events: PlanEvent[]
}
