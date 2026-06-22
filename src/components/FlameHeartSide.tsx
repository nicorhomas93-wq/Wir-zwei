interface FlameHeartSideProps {
  side: 'left' | 'right'
  pulse?: boolean
}

export default function FlameHeartSide({ side, pulse = false }: FlameHeartSideProps) {
  return (
    <img
      src="/flame-heart.png"
      alt=""
      aria-hidden
      draggable={false}
      className={`flame-heart-attached flame-heart-attached--${side} ${pulse ? 'flame-heart-attached--pulse' : ''}`}
    />
  )
}
