import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { evaluationService } from '@/services'
import { EVALUATION_CONFIG } from '@/constants/evaluation'
import type { PageParams } from '@/services'
import type {
  CreateQueryRequest,
  UpdateQueryRequest,
  CreateMappingRequest,
  UpdateCandidateRequest,
  GenerateQueriesRequest,
  GenerateCandidatesRequest,
  EvaluateLlmRequest,
  EvaluationRequest,
  ProductSearchParams,
  QuerySuggestResponse,
} from '@/services/evaluation/types'

// 쿼리 키 팩토리
export const evaluationKeys = {
  all: ['evaluation'] as const,
  queries: {
    all: ['evaluation', 'queries'] as const,
    list: (params?: PageParams) => [...evaluationKeys.queries.all, 'list', params] as const,
  },
  documents: {
    all: ['evaluation', 'documents'] as const,
    list: (queryId: number, params?: PageParams) => [...evaluationKeys.documents.all, queryId, params] as const,
  },
  products: {
    all: ['evaluation', 'products'] as const,
    search: (params: ProductSearchParams) => [...evaluationKeys.products.all, 'search', params] as const,
    detail: (productId: string) => [...evaluationKeys.products.all, 'detail', productId] as const,
  },
  categories: {
    all: ['evaluation', 'categories'] as const,
    list: (size?: number) => ['evaluation', 'categories', 'list', size] as const,
  },
  reports: {
    all: ['evaluation', 'reports'] as const,
    list: () => [...evaluationKeys.reports.all, 'list'] as const,
    detail: (reportId: number) => [...evaluationKeys.reports.all, 'detail', reportId] as const,
  },
  tasks: {
    all: ['evaluation', 'tasks'] as const,
    status: (taskId: number) => [...evaluationKeys.tasks.all, 'status', taskId] as const,
    list: (params?: PageParams) => [...evaluationKeys.tasks.all, 'list', params] as const,
    running: () => [...evaluationKeys.tasks.all, 'running'] as const,
  },
} as const

// 쿼리 조회 훅들
export function useEvaluationQueries(params: PageParams = {}) {
  return useQuery({
    queryKey: evaluationKeys.queries.list(params),
    queryFn: () => evaluationService.getQueries(params),
  })
}

export function useEvaluationDocuments(queryId: number | null, params: PageParams = {}) {
  return useQuery({
    queryKey: evaluationKeys.documents.list(queryId || 0, params),
    queryFn: () => evaluationService.getQueryDocuments(queryId!, params),
    enabled: !!queryId,
  })
}

export function useProductSearch(query: string, size?: number) {
  return useQuery({
    queryKey: evaluationKeys.products.search({ query, size }),
    queryFn: () => evaluationService.searchProducts({ query, size }),
    enabled: !!query && query.length > 0,
  })
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: evaluationKeys.products.detail(productId),
    queryFn: () => evaluationService.getProduct(productId),
    enabled: !!productId,
  })
}

export function useEvaluationCategories(size?: number, enabled: boolean = true) {
  return useQuery({
    queryKey: evaluationKeys.categories.list(size),
    queryFn: () => evaluationService.getCategories({ size }),
    enabled,
  })
}

export function useEvaluationReports() {
  return useQuery({
    queryKey: evaluationKeys.reports.list(),
    queryFn: () => evaluationService.getReports(),
  })
}

export function useEvaluationReport(reportId: number) {
  return useQuery({
    queryKey: evaluationKeys.reports.detail(reportId),
    queryFn: () => evaluationService.getReport(reportId),
    enabled: !!reportId,
  })
}

export function useDeleteEvaluationReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reportId: number) => evaluationService.deleteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.reports.all })
    },
  })
}

// 비동기 작업 상태 조회
export function useTaskStatus(taskId: number | null) {
  return useQuery({
    queryKey: evaluationKeys.tasks.status(taskId || 0),
    queryFn: () => evaluationService.getTaskStatus(taskId!),
    enabled: !!taskId,
    refetchInterval: (query) => {
      if (query.state.data?.status === 'COMPLETED' || query.state.data?.status === 'FAILED') {
        return false
      }
      return EVALUATION_CONFIG.TASK_STATUS_POLL_INTERVAL
    },
  })
}

export function useTasks(params: PageParams = {}) {
  return useQuery({
    queryKey: evaluationKeys.tasks.list(params),
    queryFn: () => evaluationService.getTasks(params),
  })
}

export function useRunningTasks() {
  return useQuery({
    queryKey: evaluationKeys.tasks.running(),
    queryFn: () => evaluationService.getRunningTasks(),
    refetchInterval: EVALUATION_CONFIG.RUNNING_TASKS_POLL_INTERVAL,
  })
}

// 기본 CRUD 뮤테이션 훅들
export function useCreateQuery() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateQueryRequest) => evaluationService.createQuery(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.queries.all })
    },
  })
}

export function useUpdateQuery() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ queryId, data }: { queryId: number, data: UpdateQueryRequest }) =>
      evaluationService.updateQuery(queryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.queries.all })
    },
  })
}

export function useDeleteQueries() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (ids: number[]) => evaluationService.deleteQueries(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.queries.all })
      queryClient.invalidateQueries({ queryKey: evaluationKeys.documents.all })
    },
  })
}

export function useAddDocumentMapping() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ queryId, data }: { queryId: number, data: CreateMappingRequest }) =>
      evaluationService.addDocumentMapping(queryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.documents.all })
      queryClient.invalidateQueries({ queryKey: evaluationKeys.queries.all })
    },
  })
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: UpdateCandidateRequest }) =>
      evaluationService.updateCandidate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.documents.all })
    },
  })
}

export function useDeleteCandidates() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (ids: number[]) => {
      // 각 ID에 대해 단일 삭제 API 호출
      await Promise.all(ids.map(id => evaluationService.deleteCandidate(id)))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.documents.all })
      queryClient.invalidateQueries({ queryKey: evaluationKeys.queries.all })
    },
  })
}

// 비동기 자동화 작업 뮤테이션들 (시간이 오래 걸리므로 비동기만 제공)
export function useGenerateQueriesAsync() {
  return useMutation({
    mutationFn: (data: GenerateQueriesRequest) => evaluationService.generateQueriesAsync(data),
  })
}

export function useGenerateCandidatesAsync() {
  return useMutation({
    mutationFn: (data: GenerateCandidatesRequest) => evaluationService.generateCandidatesAsync(data),
  })
}

export function useEvaluateLlmAsync() {
  return useMutation({
    mutationFn: (data: EvaluateLlmRequest) => evaluationService.evaluateLlmAsync(data),
  })
}

// 평가 실행 (동기)
export function useEvaluate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: EvaluationRequest) => evaluationService.evaluate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.reports.all })
    },
  })
}

// 평가 실행 (비동기)
export function useEvaluateAsync() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: { 
      reportName: string
      searchMode?: 'KEYWORD_ONLY' | 'VECTOR_MULTI_FIELD' | 'HYBRID_RRF'
      rrfK?: number
      hybridTopK?: number 
    }) => evaluationService.evaluateAsync(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.tasks.all })
    },
  })
} 

// 추천 쿼리 조회 훅
export function useRecommendQueries(params: { count?: number; minCandidates?: number; maxCandidates?: number }) {
  return useQuery<QuerySuggestResponse>({
    queryKey: ['evaluation', 'queries', 'recommend', params],
    queryFn: () => evaluationService.recommendQueries(params),
  })
}