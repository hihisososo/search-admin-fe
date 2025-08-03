import { QueryClient } from '@tanstack/react-query'

interface QueryParams {
  [key: string]: string | number | boolean | undefined
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

export const queryKeys = {
  dashboard: {
    all: ['dashboard'] as const,
    stats: (params?: QueryParams) => [...queryKeys.dashboard.all, 'stats', params] as const,
    popularKeywords: (params?: QueryParams) => [...queryKeys.dashboard.all, 'popular-keywords', params] as const,
    trendingKeywords: (params?: QueryParams) => [...queryKeys.dashboard.all, 'trending-keywords', params] as const,
    trends: (params?: QueryParams) => [...queryKeys.dashboard.all, 'trends', params] as const,
    indexDistribution: (params?: QueryParams) => [...queryKeys.dashboard.all, 'index-distribution', params] as const,
  },
  
  dictionary: {
    all: ['dictionary'] as const,
    synonym: {
      all: ['dictionary', 'synonym'] as const,
      list: (params?: QueryParams) => [...queryKeys.dictionary.synonym.all, 'list', params] as const,
      detail: (id: number) => [...queryKeys.dictionary.synonym.all, 'detail', id] as const,
    },
    typoCorrection: {
      all: ['dictionary', 'typo-correction'] as const,
      list: (params?: QueryParams) => [...queryKeys.dictionary.typoCorrection.all, 'list', params] as const,
      detail: (id: number) => [...queryKeys.dictionary.typoCorrection.all, 'detail', id] as const,
      syncStatus: () => [...queryKeys.dictionary.typoCorrection.all, 'sync-status'] as const,
    },
    stopword: {
      all: ['dictionary', 'stopword'] as const,
      list: (params?: QueryParams) => [...queryKeys.dictionary.stopword.all, 'list', params] as const,
      detail: (id: number) => [...queryKeys.dictionary.stopword.all, 'detail', id] as const,
    },
    user: {
      all: ['dictionary', 'user'] as const,
      list: (params?: QueryParams) => [...queryKeys.dictionary.user.all, 'list', params] as const,
      detail: (id: number) => [...queryKeys.dictionary.user.all, 'detail', id] as const,
    },
  },
  
  searchLogs: {
    all: ['search-logs'] as const,
    list: (params?: QueryParams) => [...queryKeys.searchLogs.all, 'list', params] as const,
    filterOptions: () => [...queryKeys.searchLogs.all, 'filter-options'] as const,
  },
} as const