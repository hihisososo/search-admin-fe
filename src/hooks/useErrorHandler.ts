import { useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { errorTracker } from '@/lib/errorHandler'

interface UseErrorHandlerOptions {
  logError?: boolean
  defaultMessage?: string
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { toast } = useToast()
  const { logError = true, defaultMessage = '오류가 발생했습니다.' } = options

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    if (logError) {
      errorTracker.captureException(error instanceof Error ? error : new Error(String(error)))
    }

    let message = customMessage || defaultMessage
    
    if (error instanceof Error) {
      if (error.message.includes('500') || error.message.includes('서버 내부 오류')) {
        message = '서버에서 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      } else if (error.message.includes('401')) {
        message = '로그인이 필요합니다.'
      } else if (error.message.includes('403')) {
        message = '접근 권한이 없습니다.'
      } else if (error.message.includes('404')) {
        message = '요청한 리소스를 찾을 수 없습니다.'
      } else {
        message = customMessage || error.message
      }
    }

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