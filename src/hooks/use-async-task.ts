import { useState, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTask as useTaskStatus, useRunningTasks } from './use-task'

interface AsyncTaskHookOptions {
  onComplete?: (result?: string) => void
  onError?: (error: string) => void
  shouldRefreshData?: boolean
  recoverOnMountOnly?: boolean
}

export function useAsyncTask(
  taskType: 'QUERY_GENERATION' | 'CANDIDATE_GENERATION' | 'LLM_EVALUATION' | 'EVALUATION_EXECUTION',
  options: AsyncTaskHookOptions = {}
) {
  const [taskId, setTaskId] = useState<number | null>(null)
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<number>>(new Set())
  const queryClient = useQueryClient()
  const hasAttemptedRecoveryRef = useRef(false)
  
  const { onComplete, onError, shouldRefreshData = true, recoverOnMountOnly = true } = options
  
  const runningTasksQuery = useRunningTasks()
  const taskStatus = useTaskStatus(taskId)

  // 페이지 로드 시 실행 중인 작업 복구
  useEffect(() => {
    if (!runningTasksQuery.data || taskId) return

    // 복구는 마운트 시 1회만 시도 (다른 작업으로 재복구되는 문제 방지)
    if (recoverOnMountOnly && hasAttemptedRecoveryRef.current) return

    const runningTask = runningTasksQuery.data.find(task => task.taskType === taskType)
    if (runningTask) {
      setTaskId(runningTask.id)
      // Task recovery: ${taskType}
    }

    if (recoverOnMountOnly) {
      hasAttemptedRecoveryRef.current = true
    }
  }, [runningTasksQuery.data, taskId, taskType, recoverOnMountOnly])

  // 작업 완료/실패 처리
  useEffect(() => {
    if (!taskId || !taskStatus.data) return
    
    // 이미 처리된 작업인지 확인
    if (completedTaskIds.has(taskId)) return
    
    if (taskStatus.data.status === 'COMPLETED') {
      // Task completed: ${taskType}
      
      // 완료된 작업 ID 기록
      setCompletedTaskIds(prev => new Set(prev).add(taskId))
      
      if (onComplete) {
        onComplete(taskStatus.data.result ?? undefined)
      }
      
      if (shouldRefreshData) {
        // evaluation 관련 쿼리 무효화
        queryClient.invalidateQueries({ queryKey: ['evaluation'] })
      }
      
      setTaskId(null)
    } else if (taskStatus.data.status === 'FAILED') {
      console.error(`❌ ${taskType} 실패:`, taskStatus.data.errorMessage)
      
      // 실패한 작업 ID 기록
      setCompletedTaskIds(prev => new Set(prev).add(taskId))
      
      if (onError) {
        onError(taskStatus.data.errorMessage || '알 수 없는 오류')
      }
      
      setTaskId(null)
    }
  }, [taskId, taskStatus.data?.status, taskType, queryClient, completedTaskIds, onComplete, onError, shouldRefreshData])

  const startTask = (newTaskId: number) => {
    if (!newTaskId || typeof newTaskId !== 'number') {
      console.error('[useAsyncTask.startTask] Invalid taskId:', newTaskId)
      return
    }
    setTaskId(newTaskId)
  }

  const isRunning = !!taskId
  const progress = taskStatus.data?.progress || 0
  const status = taskStatus.data?.status
  const result = taskStatus.data?.result

  return {
    taskId,
    isRunning,
    progress,
    status,
    result,
    startTask,
    data: taskStatus.data
  }
} 