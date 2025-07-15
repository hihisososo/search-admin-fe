import { useState } from 'react'

// 로딩 상태 타입
export type LoadingState = 
  | { type: 'idle' }
  | { type: 'loading'; message?: string }
  | { type: 'success'; message?: string }
  | { type: 'error'; message: string }

export function useLoadingState() {
  const [state, setState] = useState<LoadingState>({ type: 'idle' })

  const setLoading = (message?: string) => {
    setState({ type: 'loading', message })
  }

  const setSuccess = (message?: string) => {
    setState({ type: 'success', message })
  }

  const setError = (message: string) => {
    setState({ type: 'error', message })
  }

  const setIdle = () => {
    setState({ type: 'idle' })
  }

  // 상태 확인 함수들
  const isLoading = state.type === 'loading'
  const isSuccess = state.type === 'success'
  const isError = state.type === 'error'
  const isIdle = state.type === 'idle'

  return {
    state,
    isLoading,
    isSuccess,
    isError,
    isIdle,
    setLoading,
    setSuccess,
    setError,
    setIdle
  }
} 