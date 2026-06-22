import { useId } from 'react'

interface FlameHeartProps {
  variant?: 'inline' | 'empty'
  className?: string
}

export default function FlameHeart({ variant = 'inline', className = '' }: FlameHeartProps) {
  const uid = useId().replace(/:/g, '')
  const gradientId = `flame-accent-${uid}`

  return (
    <svg
      viewBox="0 0 14 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flame-heart flame-heart--${variant} ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="7" y1="0" x2="7" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8b5a2b" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#4a3018" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        d="M7 1.2C6.2 2.4 5.4 3.2 5.6 4.4C5.8 5.4 6.6 5.8 7 5.2C7.4 5.8 8.2 5.4 8.4 4.4C8.6 3.2 7.8 2.4 7 1.2Z"
        fill={`url(#${gradientId})`}
      />

      <path
        d="M7 14.2C7 14.2 1.8 10.2 1.8 6.4C1.8 4.2 3.4 2.6 5.4 2.6C6.3 2.6 7.1 3.1 7 4.1C6.9 3.1 7.7 2.6 8.6 2.6C10.6 2.6 12.2 4.2 12.2 6.4C12.2 10.2 7 14.2 7 14.2Z"
        fill="#141414"
      />
    </svg>
  )
}
