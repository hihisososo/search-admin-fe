import React from 'react'

interface ErrorMessageProps {
  message: string
}

export const ErrorMessage = React.memo(({ message }: ErrorMessageProps) => (
  <div className="text-red-700 text-sm mb-3 p-2 bg-red-50 rounded border border-red-200">
    {message}
  </div>
))