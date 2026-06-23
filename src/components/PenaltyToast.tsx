import { useEffect } from 'react'
import { formatTimelineDelta } from '../utils/penaltyTimeline'

export interface PenaltyToastItem {
  id: string
  delta: number
  title: string
  targetName: string
}

interface PenaltyToastProps {
  items: PenaltyToastItem[]
  onDismiss: (id: string) => void
}

export default function PenaltyToast({ items, onDismiss }: PenaltyToastProps) {
  if (items.length === 0) return null

  return (
    <div className="penalty-toast-stack" aria-live="polite">
      {items.map((item) => (
        <ToastItem key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({
  item,
  onDismiss,
}: {
  item: PenaltyToastItem
  onDismiss: (id: string) => void
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(item.id), 2600)
    return () => window.clearTimeout(timer)
  }, [item.id, onDismiss])

  const isPlus = item.delta > 0

  return (
    <div
      className={`penalty-toast penalty-toast--enter ${isPlus ? 'penalty-toast--plus' : 'penalty-toast--minus'}`}
    >
      <span className="penalty-toast-delta">{formatTimelineDelta(item.delta)}</span>
      <span className="penalty-toast-text">
        {item.title}
        <span className="penalty-toast-who"> → {item.targetName}</span>
      </span>
    </div>
  )
}
