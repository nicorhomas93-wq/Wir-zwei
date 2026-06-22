export interface DreamVariant {
  variant: number
  delay: number
  depth: 'front' | 'mid' | 'back'
  glow: boolean
}

const VARIANTS: DreamVariant[] = [
  { variant: 0, delay: 0, depth: 'front', glow: true },
  { variant: 1, delay: 140, depth: 'mid', glow: false },
  { variant: 2, delay: 280, depth: 'back', glow: false },
  { variant: 3, delay: 90, depth: 'mid', glow: true },
  { variant: 4, delay: 220, depth: 'front', glow: false },
  { variant: 5, delay: 360, depth: 'back', glow: true },
]

export function getDreamVariant(index: number): DreamVariant {
  return VARIANTS[index % VARIANTS.length]
}
