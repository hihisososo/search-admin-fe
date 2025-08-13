import { apiClient } from '../common/api-client'
import type { PageParams } from '../common/types'
import type {
  EvaluationQueryListResponse,
  EvaluationDocumentListResponse,
  EvaluationProduct,
  CreateQueryRequest,
  CreateQueryResponse,
  UpdateQueryRequest,
  CreateMappingRequest,
  UpdateCandidateRequest,
  GenerateQueriesRequest,
  GenerateCandidatesRequest,
  EvaluateLlmRequest,
  EvaluationRequest,
  EvaluationExecuteResponse,
  EvaluationReport,
  EvaluationReportSummary,
  ProductSearchParams,
  AsyncTaskResponse,
  AsyncTaskStatus
} from './types'

class EvaluationService {
  private readonly baseEndpoint = '/v1/evaluation'

  // 1. 쿼리 관리
  
  // 쿼리 리스트 조회 (왼쪽 패널)
  async getQueries(params: PageParams = {}): Promise<EvaluationQueryListResponse> {
    return apiClient.get<EvaluationQueryListResponse>(`${this.baseEndpoint}/queries`, params)
  }

  // 쿼리 생성
  async createQuery(data: CreateQueryRequest): Promise<CreateQueryResponse> {
    return apiClient.post<CreateQueryResponse>(`${this.baseEndpoint}/queries`, data)
  }

  // 쿼리 수정
  async updateQuery(queryId: number, data: UpdateQueryRequest): Promise<void> {
    return apiClient.put<void>(`${this.baseEndpoint}/queries/${queryId}`, data)
  }

  // 쿼리 일괄 삭제
  async deleteQueries(ids: number[]): Promise<void> {
    return apiClient.request<void>(`${this.baseEndpoint}/queries`, {
      method: 'DELETE',
      body: JSON.stringify({ ids })
    })
  }

  // 쿼리별 문서 조회 (오른쪽 패널)
  async getQueryDocuments(queryId: number, params: PageParams = {}): Promise<EvaluationDocumentListResponse> {
    return apiClient.get<EvaluationDocumentListResponse>(`${this.baseEndpoint}/queries/${queryId}/documents`, params)
  }

  // 상품 매핑 추가
  async addDocumentMapping(queryId: number, data: CreateMappingRequest): Promise<void> {
    return apiClient.post<void>(`${this.baseEndpoint}/queries/${queryId}/documents`, data)
  }

  // 상품 후보군 수정
  async updateCandidate(candidateId: number, data: UpdateCandidateRequest): Promise<void> {
    return apiClient.put<void>(`${this.baseEndpoint}/candidates/${candidateId}`, data)
  }

  // 후보군 일괄 삭제
  async deleteCandidates(ids: number[]): Promise<void> {
    return apiClient.request<void>(`${this.baseEndpoint}/candidates`, {
      method: 'DELETE',
      body: JSON.stringify({ ids })
    })
  }

  // 2. 자동화 기능 (모두 비동기로만 제공)

  // 랜덤 쿼리 생성 (비동기) - 시간이 오래 걸리므로 비동기만 제공
  async generateQueriesAsync(data: GenerateQueriesRequest): Promise<AsyncTaskResponse> {
    return apiClient.post<AsyncTaskResponse>(`${this.baseEndpoint}/queries/generate-async`, data)
  }

  // 후보군 생성 (비동기) - 시간이 오래 걸리므로 비동기만 제공
  async generateCandidatesAsync(data: GenerateCandidatesRequest): Promise<AsyncTaskResponse> {
    return apiClient.post<AsyncTaskResponse>(`${this.baseEndpoint}/candidates/generate-async`, data)
  }

  // LLM 자동 평가 (비동기) - 시간이 오래 걸리므로 비동기만 제공
  async evaluateLlmAsync(data: EvaluateLlmRequest): Promise<AsyncTaskResponse> {
    return apiClient.post<AsyncTaskResponse>(`${this.baseEndpoint}/candidates/evaluate-llm-async`, data)
  }

  // 비동기 작업 상태 조회
  async getTaskStatus(taskId: number): Promise<AsyncTaskStatus> {
    return apiClient.get<AsyncTaskStatus>(`${this.baseEndpoint}/tasks/${taskId}`)
  }

  // 비동기 작업 리스트 조회
  async getTasks(params: PageParams = {}): Promise<{ tasks: AsyncTaskStatus[], totalCount: number, totalPages: number, currentPage: number, size: number }> {
    return apiClient.get(`${this.baseEndpoint}/tasks`, params)
  }

  // 실행 중인 작업 조회
  async getRunningTasks(): Promise<AsyncTaskStatus[]> {
    return apiClient.get<AsyncTaskStatus[]>(`${this.baseEndpoint}/tasks/running`)
  }

  // 3. 평가 실행

  // 평가 실행 (precision, recall 계산)
  async evaluate(data: EvaluationRequest): Promise<EvaluationExecuteResponse> {
    return apiClient.post<EvaluationExecuteResponse>(`${this.baseEndpoint}/evaluate`, data)
  }

  // 리포트 리스트 조회
  async getReports(): Promise<EvaluationReportSummary[]> {
    return apiClient.get<EvaluationReportSummary[]>(`${this.baseEndpoint}/reports`)
  }

  // 리포트 상세 조회
  async getReport(reportId: number): Promise<EvaluationReport> {
    return apiClient.get<EvaluationReport>(`${this.baseEndpoint}/reports/${reportId}`)
  }

  // 추천 쿼리 조회 (저장 없이 프리뷰용)
  async recommendQueries(params: { count?: number; minCandidates?: number; maxCandidates?: number }): Promise<import('./types').QuerySuggestResponse> {
    return apiClient.get(`${this.baseEndpoint}/queries/recommend`, params)
  }

  // 4. 상품 검색

  // 상품 검색 (매핑 추가시 사용)
  async searchProducts(params: ProductSearchParams): Promise<EvaluationProduct[]> {
    return apiClient.get<EvaluationProduct[]>(`${this.baseEndpoint}/products/search`, params)
  }

  // 상품 상세 조회
  async getProduct(productId: string): Promise<EvaluationProduct> {
    return apiClient.get<EvaluationProduct>(`${this.baseEndpoint}/products/${productId}`)
  }

  // 5. 카테고리 조회
  async getCategories(params: { size?: number } = {}): Promise<import('./types').EvaluationCategoryListResponse> {
    return apiClient.get(`${this.baseEndpoint}/categories`, params)
  }
}

export const evaluationService = new EvaluationService() 