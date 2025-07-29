import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTaskStatus, useRunningTasks } from './use-evaluation'
import type { AsyncTaskStatus } from '@/services/evaluation/types'

interface AsyncTaskHookOptions {
  onComplete?: (result?: string) => void
  onError?: (error: string) => void
  shouldRefreshData?: boolean
}

export function useAsyncTask(
  taskType: 'QUERY_GENERATION' | 'CANDIDATE_GENERATION' | 'LLM_EVALUATION',
  options: AsyncTaskHookOptions = {}
) {
  const [taskId, setTaskId] = useState<number | null>(null)
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<number>>(new Set())
  const queryClient = useQueryClient()
  
  const { onComplete, onError, shouldRefreshData = true } = options
  
  const runningTasksQuery = useRunningTasks()
  const taskStatus = useTaskStatus(taskId)

  // 페이지 로드 시 실행 중인 작업 복구
  useEffect(() => {
    if (runningTasksQuery.data && runningTasksQuery.data.length > 0 && !taskId) {
      const runningTask = runningTasksQuery.data.find(task => (task as any).taskType === taskType)
      if (runningTask) {
        setTaskId(runningTask.id)
        console.log(`🔄 ${taskType} 작업 복구:`, runningTask.id, runningTask.message)
      }
    }
  }, [runningTasksQuery.data, taskId, taskType])

  // 작업 완료/실패 처리
  useEffect(() => {
    if (!taskId || !taskStatus.data) return
    
    // 이미 처리된 작업인지 확인
    if (completedTaskIds.has(taskId)) return
    
    if (taskStatus.data.status === 'COMPLETED') {
      console.log(`✅ ${taskType} 완료:`, taskStatus.data.message)
      
      // 완료된 작업 ID 기록
      setCompletedTaskIds(prev => new Set(prev).add(taskId))
      
      if (onComplete) {
        onComplete(taskStatus.data.result)
      }
      
      if (shouldRefreshData) {
        // evaluation 관련 쿼리 무효화
        queryClient.invalidateQueries({ queryKey: ['evaluation'] })
      }
      
      setTaskId(null)
    } else if (taskStatus.data.status === 'FAILED') {
      console.error(`❌ ${taskType} 실패:`, (taskStatus.data as any).errorMessage)
      
      // 실패한 작업 ID 기록
      setCompletedTaskIds(prev => new Set(prev).add(taskId))
      
      if (onError) {
        onError((taskStatus.data as any).errorMessage || '알 수 없는 오류')
      }
      
      setTaskId(null)
    }
  }, [taskId, taskStatus.data?.status, taskType, queryClient, completedTaskIds, onComplete, onError, shouldRefreshData])

  const startTask = (newTaskId: number) => {
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