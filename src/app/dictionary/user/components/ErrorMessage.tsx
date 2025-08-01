import { memo } from 'react'

interface ErrorMessageProps {
  message: string
}

export const ErrorMessage = memo(({ message }: ErrorMessageProps) => (
  <div className="text-red-700 text-sm mb-3 p-2 bg-red-50 rounded border border-red-200">
    {message}
  </div>
))

ErrorMessage.displayName = 'ErrorMessage'