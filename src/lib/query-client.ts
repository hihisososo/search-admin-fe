import { QueryClient } from '@tanstack/react-query'
import { APIError } from './errorHandler'

// React Query 기본 설정
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5분간 캐시 유지
      staleTime: 5 * 60 * 1000,
      // 30분 후 캐시 삭제
      gcTime: 30 * 60 * 1000,
      // 에러 시 재시도 설정
      retry: (failureCount, error) => {
        // APIError 4xx는 재시도 안함
        if (error instanceof APIError && error.status >= 400 && error.status < 500) {
          return false
        }
        // 최대 3번 재시도
        return failureCount < 3
      },
      // 재시도 간격 (지수 백오프)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // 뮤테이션 에러 시 재시도 안함
      retry: false,
    },
  },
})

// 자주 사용하는 쿼리 키 팩토리
export const queryKeys = {
  // 대시보드
  dashboard: {
    all: ['dashboard'] as const,
    stats: (params?: any) => [...queryKeys.dashboard.all, 'stats', params] as const,
    popularKeywords: (params?: any) => [...queryKeys.dashboard.all, 'popular-keywords', params] as const,
    trendingKeywords: (params?: any) => [...queryKeys.dashboard.all, 'trending-keywords', params] as const,
    trends: (params?: any) => [...queryKeys.dashboard.all, 'trends', params] as const,
    indexDistribution: (params?: any) => [...queryKeys.dashboard.all, 'index-distribution', params] as const,
  },
  
  // 사전 관리
  dictionary: {
    all: ['dictionary'] as const,
    synonym: {
      all: ['dictionary', 'synonym'] as const,
      list: (params?: any) => [...queryKeys.dictionary.synonym.all, 'list', params] as const,
      detail: (id: number) => [...queryKeys.dictionary.synonym.all, 'detail', id] as const,
    },
    typoCorrection: {
      all: ['dictionary', 'typo-correction'] as const,
      list: (params?: any) => [...queryKeys.dictionary.typoCorrection.all, 'list', params] as const,
      detail: (id: number) => [...queryKeys.dictionary.typoCorrection.all, 'detail', id] as const,
      syncStatus: () => [...queryKeys.dictionary.typoCorrection.all, 'sync-status'] as const,
    },
    stopword: {
      all: ['dictionary', 'stopword'] as const,
      list: (params?: any) => [...queryKeys.dictionary.stopword.all, 'list', params] as const,
      detail: (id: number) => [...queryKeys.dictionary.stopword.all, 'detail', id] as const,
    },
    user: {
      all: ['dictionary', 'user'] as const,
      list: (params?: any) => [...queryKeys.dictionary.user.all, 'list', params] as const,
      detail: (id: number) => [...queryKeys.dictionary.user.all, 'detail', id] as const,
    },
  },
  
  // 검색 로그
  searchLogs: {
    all: ['search-logs'] as const,
    list: (params?: any) => [...queryKeys.searchLogs.all, 'list', params] as const,
    filterOptions: () => [...queryKeys.searchLogs.all, 'filter-options'] as const,
  },
} as const 