import { useEffect, useRef, useState } from 'react'

interface AnimatedScoreProps {
  value: number
  pulse?: 'plus' | 'minus' | null
}

export default function AnimatedScore({ value, pulse }: AnimatedScoreProps) {
  const [display, setDisplay] = useState(value)
  const prevValue = useRef(value)

  useEffect(() => {
    const from = prevValue.current
    const to = value
    prevValue.current = value

    if (from === to) {
      setDisplay(to)
      return
    }

    const steps = Math.abs(to - from)
    const direction = to > from ? 1 : -1
    let step = 0

    const tick = window.setInterval(() => {
      step += 1
      setDisplay(from + direction * step)
      if (step >= steps) window.clearInterval(tick)
    }, 75)

    return () => window.clearInterval(tick)
  }, [value])

  const pulseClass =
    pulse === 'plus'
      ? 'penalty-score-value--pulse-plus'
      : pulse === 'minus'
        ? 'penalty-score-value--pulse-minus'
        : ''

  return (
    <p className={`penalty-score-value ${pulseClass}`.trim()} aria-live="polite">
      {display}
    </p>
  )
}
