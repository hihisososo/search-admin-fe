import { Button } from "@/components/ui/button"

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="text-red-600 text-center py-4">
      {message}
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="ml-2">
          재시도
        </Button>
      )}
    </div>
  )
}