import type { EnergyLevel } from '../utils/energy'
import { getEnergyLabel } from '../utils/energy'

interface EnergyBadgeProps {
  level: EnergyLevel
}

export default function EnergyBadge({ level }: EnergyBadgeProps) {
  return (
    <span className={`energy-badge energy-badge--${level}`} aria-label={`Energie: ${getEnergyLabel(level)}`}>
      {getEnergyLabel(level)}
    </span>
  )
}
