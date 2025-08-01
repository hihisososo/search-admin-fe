
// 쿼리 관련 타입 (실제 백엔드 응답 구조에 맞게 수정)
export interface EvaluationQuery {
  id: number
  query: string
  documentCount: number      // 실제 백엔드 필드명
  correctCount: number       // 실제 백엔드 필드명
  incorrectCount: number     // 실제 백엔드 필드명
  unspecifiedCount: number   // 실제 백엔드 필드명
  createdAt: string
  updatedAt: string
}

export interface EvaluationQueryListResponse {
  queries: EvaluationQuery[]
  totalCount: number
  totalPages: number
  currentPage: number
  size: number
  hasNext: boolean
  hasPrevious: boolean
}

// 관련성 상태 enum (실제 백엔드에 맞게)
export type RelevanceStatus = 'UNSPECIFIED' | 'RELEVANT' | 'IRRELEVANT'  // UNSPECIFIED가 맞음

// 문서 관련 타입
export interface EvaluationDocument {
  candidateId: number
  productId: string
  productName: string
  specs: string
  relevanceStatus: RelevanceStatus
  evaluationReason: string
}

export interface EvaluationDocumentListResponse {
  query: string
  documents: EvaluationDocument[]
  totalCount: number
  totalPages: number
  currentPage: number
  size: number
  hasNext: boolean
  hasPrevious: boolean
}

// 상품 관련 타입
export interface EvaluationProduct {
  id: string
  name: string
  specs: string
  brand: string
  price?: number
}



// 매핑 관련 타입
export interface CreateMappingRequest {
  productId: string
}



// 쿼리 관련 요청/응답 타입
export interface CreateQueryRequest {
  value: string
}

export interface CreateQueryResponse {
  id: number
  query: string
  count: number
  createdAt: string
  updatedAt: string
}

export interface UpdateQueryRequest {
  value: string
}

// 일괄 삭제 요청 타입  
export interface DeleteQueriesRequest {
  ids: number[]
}

// 자동화 관련 타입
export interface GenerateQueriesRequest {
  count: number
}

export interface GenerateCandidatesRequest {
  generateForAllQueries?: boolean
  queryIds?: number[]
}

export interface EvaluateLlmRequest {
  evaluateAllQueries?: boolean
  queryIds?: number[]
}

// 비동기 작업 관련 타입
export interface AsyncTaskResponse {
  taskId: number
  message: string
}

export interface AsyncTaskStatus {
  id: number
  type: 'QUERY_GENERATION' | 'CANDIDATE_GENERATION' | 'LLM_EVALUATION'
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  progress: number
  message: string
  result?: any
  createdAt: string
  startedAt?: string
  completedAt?: string
}

export interface UpdateCandidateRequest {
  relevanceStatus: RelevanceStatus
  evaluationReason: string
}

// 평가 관련 타입
export interface EvaluationRequest {
  reportName: string
  retrievalSize?: number
}



export interface QueryEvaluationDetail {
  query: string
  precision: number
  recall: number
  f1Score: number
  relevantCount: number
  retrievedCount: number
  correctCount: number
  missingDocuments: string[]
  wrongDocuments: string[]
}

// 평가 실행 응답 (evaluate API)
export interface EvaluationExecuteResponse {
  reportId: number
  reportName: string
  precision: number
  recall: number
  totalQueries: number
  evaluatedQueries: number
  createdAt: string
  averagePrecision: number
  averageRecall: number
  averageF1Score: number
  totalRelevantDocuments: number
  totalRetrievedDocuments: number
  totalCorrectDocuments: number
}

// 리포트 상세 조회 응답 (리포트 리스트와 동일)
export interface EvaluationReport {
  id: number
  reportName: string
  totalQueries: number
  averagePrecision: number
  averageRecall: number
  averageF1Score: number
  detailedResults: string
  totalRelevantDocuments: number
  totalRetrievedDocuments: number
  totalCorrectDocuments: number
  createdAt: string
}

export interface EvaluationReportSummary {
  id: number
  reportName: string
  totalQueries: number
  averagePrecision: number
  averageRecall: number
  averageF1Score: number
  detailedResults: string
  totalRelevantDocuments: number
  totalRetrievedDocuments: number
  totalCorrectDocuments: number
  createdAt: string
}

// 검색 파라미터
export interface ProductSearchParams {
  query: string
  size?: number
} 