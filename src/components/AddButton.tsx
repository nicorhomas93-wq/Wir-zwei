import { Link } from 'react-router-dom'

interface AddButtonProps {
  label: string
  onClick?: () => void
  to?: string
  variant?: 'card' | 'fab'
}

export default function AddButton({ label, onClick, to, variant = 'fab' }: AddButtonProps) {
  const className = variant === 'fab' ? 'fab tap-active' : 'btn-add-card tap-active'

  const content =
    variant === 'fab' ? (
      <>
        <span className="fab-icon" aria-hidden>
          +
        </span>
        <span className="fab-label">{label}</span>
      </>
    ) : (
      <span>+ {label}</span>
    )

  if (to) {
    return (
      <Link to={to} className={className} aria-label={label}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className} aria-label={label}>
      {content}
    </button>
  )
}
