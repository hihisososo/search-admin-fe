import React from 'react'
import { Button } from '@/components/ui/button'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export const ErrorMessage = React.memo(({ message, onRetry }: ErrorMessageProps) => (
  <div className="text-red-700 text-sm mb-3 p-3 bg-red-50 rounded border border-red-200">
    <div className="flex items-center justify-between">
      <span>{message}</span>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="h-7 px-3 text-xs border-red-300 text-red-600 hover:bg-red-100"
        >
          재시도
        </Button>
      )}
    </div>
  </div>
))