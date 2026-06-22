interface DeleteButtonProps {
  onConfirm: () => void
  label?: string
  confirmMessage?: string
  className?: string
}

export default function DeleteButton({
  onConfirm,
  label = 'Löschen',
  confirmMessage = 'Wirklich löschen?',
  className = '',
}: DeleteButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm(confirmMessage)) onConfirm()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`delete-btn tap-active ${className}`.trim()}
      aria-label={label}
    >
      {label}
    </button>
  )
}
