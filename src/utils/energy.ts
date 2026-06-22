export type EnergyLevel = 'ruhig' | 'glimmt' | 'brennt' | 'feuer'

export function getEnergyLevel(count: number): EnergyLevel {
  if (count === 0) return 'ruhig'
  if (count <= 2) return 'glimmt'
  if (count <= 5) return 'brennt'
  return 'feuer'
}

export function getEnergyLabel(level: EnergyLevel): string {
  switch (level) {
    case 'ruhig':
      return 'ruhig'
    case 'glimmt':
      return 'glimmt'
    case 'brennt':
      return 'brennt'
    case 'feuer':
      return '🔥🔥🔥'
  }
}

export function isRecentEntry(createdAt: string, withinHours = 24): boolean {
  const diff = Date.now() - new Date(createdAt).getTime()
  return diff >= 0 && diff <= withinHours * 60 * 60 * 1000
}

export function isWithinHours(createdAt: string, hours: number): boolean {
  const diff = Date.now() - new Date(createdAt).getTime()
  return diff >= 0 && diff <= hours * 60 * 60 * 1000
}
