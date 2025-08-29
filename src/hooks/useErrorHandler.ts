import { useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { errorTracker } from '@/lib/errorHandler'
import { getErrorMessage, ERROR_MESSAGES } from '@/constants/error-messages'

interface UseErrorHandlerOptions {
  logError?: boolean
  defaultMessage?: string
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { toast } = useToast()
  const { logError = true, defaultMessage = ERROR_MESSAGES.default } = options

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    if (logError) {
      errorTracker.captureException(error instanceof Error ? error : new Error(String(error)))
    }

    const message = error instanceof Error 
      ? getErrorMessage(error, customMessage)
      : customMessage || defaultMessage

    toast({
      title: '오류',
      description: message,
      variant: 'destructive'
    })

    return message
  }, [toast, logError, defaultMessage])

  const handleAsyncError = useCallback(async <T,>(
    asyncFn: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void
      onError?: (error: unknown) => void
      errorMessage?: string
    }
  ): Promise<T | null> => {
    try {
      const result = await asyncFn()
      options?.onSuccess?.(result)
      return result
    } catch (error) {
      handleError(error, options?.errorMessage)
      options?.onError?.(error)
      return null
    }
  }, [handleError])

  return {
    handleError,
    handleAsyncError
  }
}