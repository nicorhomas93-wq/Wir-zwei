import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from 'react'
import type { AppData } from '../types'
import { getStore, startFirebaseSync, subscribeStore } from './sync'

const DataContext = createContext<AppData | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const data = useSyncExternalStore(subscribeStore, getStore, getStore)

  useEffect(() => startFirebaseSync(), [])

  return <DataContext.Provider value={data}>{children}</DataContext.Provider>
}

export function useAppData(): AppData {
  const data = useContext(DataContext)
  if (!data) throw new Error('useAppData must be used within DataProvider')
  return data
}
