interface EmptyStateProps {
  message: string
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="empty-state animate-fade-in">
      <p className="whitespace-pre-line">{message}</p>
    </div>
  )
}
