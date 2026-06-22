import type { ReactNode } from 'react'
import FlameHeartSide from './FlameHeartSide'

interface SectionCardFrameProps {
  children: ReactNode
  showHearts?: boolean
  heartPulse?: boolean
  hasNew?: boolean
}

export default function SectionCardFrame({
  children,
  showHearts = false,
  heartPulse = false,
  hasNew = false,
}: SectionCardFrameProps) {
  const classes = [
    'section-card-frame',
    showHearts ? 'section-card-frame--hearts' : '',
    hasNew ? 'section-card-frame--new' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      {showHearts && (
        <>
          <FlameHeartSide side="left" pulse={heartPulse} />
          <FlameHeartSide side="right" pulse={heartPulse} />
        </>
      )}
      {children}
    </div>
  )
}
