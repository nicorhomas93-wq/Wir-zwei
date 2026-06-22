import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User } from '../types'
import { recordUserActivity } from '../storage/meta'

const USERS: Record<string, { password: string; user: User }> = {
  marie: { password: 'herz123', user: { id: 'marie', name: 'Marie' } },
  nico: { password: 'herz123', user: { id: 'nico', name: 'Nico' } },
}

const SESSION_KEY = 'wir-zwei-session'

interface AuthContextValue {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const { id } = JSON.parse(raw) as { id: string }
    const entry = USERS[id]
    return entry?.user ?? null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadSession)

  const login = (username: string, password: string): boolean => {
    const key = username.trim().toLowerCase()
    const entry = USERS[key]
    if (!entry || entry.password !== password) return false

    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: entry.user.id }))
    recordUserActivity(entry.user.id)
    setUser(entry.user)
    return true
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const USER_NAMES = Object.values(USERS).map((u) => u.user.name)
