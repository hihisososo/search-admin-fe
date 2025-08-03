interface EmptyStateProps {
  message?: string
  hasError?: boolean
}

export function EmptyState({ message = "데이터가 없습니다", hasError = false }: EmptyStateProps) {
  return (
    <div className="text-center py-8 text-gray-500">
      {hasError ? "오류가 발생했습니다" : message}
    </div>
  )
}