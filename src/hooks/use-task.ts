import { useQuery } from '@tanstack/react-query'
import { taskService } from '@/services'
import type { PageParams } from '@/services'

// 쿼리 키 팩토리
export const taskKeys = {
  all: ['tasks'] as const,
  detail: (taskId: number) => ['tasks', taskId] as const,
  list: (params?: PageParams) => ['tasks', 'list', params] as const,
  running: () => ['tasks', 'running'] as const,
} as const

// Task 상태 조회
export function useTask(taskId: number | null, options?: { 
  refetchInterval?: number | ((data: any) => number | false) 
}) {
  return useQuery({
    queryKey: taskKeys.detail(taskId || 0),
    queryFn: () => taskService.getTask(taskId!),
    enabled: !!taskId,
    refetchInterval: options?.refetchInterval || ((query) => {
      const status = query.state.data?.status
      if (status === 'COMPLETED' || status === 'FAILED') {
        return false
      }
      return 3000 // 3초마다 폴링
    }),
  })
}

// 실행 중인 작업 목록 조회
export function useRunningTasks(options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: taskKeys.running(),
    queryFn: () => taskService.getRunningTasks(),
    refetchInterval: options?.refetchInterval || 5000, // 5초마다 폴링
    staleTime: 4000,
  })
}

// 작업 목록 조회
export function useTasks(params: PageParams = {}) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => taskService.getTasks(params),
  })
}