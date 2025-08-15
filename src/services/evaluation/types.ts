
// 쿼리 관련 타입 (실제 백엔드 응답 구조에 맞게 수정)
export interface EvaluationQuery {
  id: number
  query: string
  documentCount: number
  score2Count: number
  score1Count: number
  score0Count: number
  scoreMinus1Count: number
  createdAt: string
  updatedAt: string
  // 사람 검수 완료 여부 (백엔드가 제공하는 경우 표시용)
  reviewed?: boolean
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

// 카테고리 타입
export interface EvaluationCategory {
  name: string
  docCount: number
}

export interface EvaluationCategoryListResponse {
  categories: EvaluationCategory[]
}



// 매핑 관련 타입
export interface CreateMappingRequest {
  productId: string
}



// 쿼리 관련 요청/응답 타입
export interface CreateQueryRequest {
  value: string
}

// createQuery 응답은 EvaluationQuery 전체를 반환
export type CreateQueryResponse = EvaluationQuery

export interface UpdateQueryRequest {
  value?: string
  reviewed?: boolean
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
  taskType: 'QUERY_GENERATION' | 'CANDIDATE_GENERATION' | 'LLM_EVALUATION'
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  progress: number
  message: string
  errorMessage?: string | null
  result?: string | null
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
  ndcg: number
  relevantCount: number
  retrievedCount: number
  correctCount: number
  missingDocuments: DocumentInfo[]
  wrongDocuments: DocumentInfo[]
}

// 평가 실행 응답 (evaluate API)
export interface EvaluationExecuteResponse {
  reportId: number
  reportName: string
  totalQueries: number
  createdAt: string
  averageNdcg: number
  totalRelevantDocuments: number
  totalRetrievedDocuments: number
  totalCorrectDocuments: number
  // 백엔드 예시 응답에 포함되는 쿼리별 상세 (선택적)
  queryDetails?: Array<{
    query: string
    ndcg: number
    relevantCount: number
    retrievedCount: number
    correctCount: number
    missingDocuments?: DocumentInfo[]
    wrongDocuments?: DocumentInfo[]
  }>
}

// 리포트 상세 조회 응답 (리포트 리스트와 동일)
export interface EvaluationReport {
  id: number
  reportName: string
  totalQueries: number
  averageNdcg: number
  queryDetails: Array<
    QueryEvaluationDetail & {
      retrievedDocuments?: RetrievedDocument[]
      groundTruthDocuments?: GroundTruthDocument[]
    }
  >
  totalRelevantDocuments: number
  totalRetrievedDocuments: number
  totalCorrectDocuments: number
  createdAt: string
}

export interface EvaluationReportSummary {
  id: number
  reportName: string
  totalQueries: number
  averageNdcg: number
  totalRelevantDocuments: number
  totalRetrievedDocuments: number
  totalCorrectDocuments: number
  createdAt: string
}

// 검색 파라미터
export interface ProductSearchParams {
  query: string
  size?: number
  [key: string]: string | number | boolean | string[] | undefined
} 

// 추천 쿼리 응답 타입
export interface QuerySuggestResponseItem {
  query: string
  candidateCount: number
}

export interface QuerySuggestResponse {
  requestedCount: number
  returnedCount: number
  minCandidates?: number
  maxCandidates?: number
  items: QuerySuggestResponseItem[]
}

// 작업 리스트 응답 타입
export interface AsyncTaskListResponse {
  tasks: AsyncTaskStatus[]
  totalCount: number
  totalPages: number
  currentPage: number
  size: number
}

// 평가 리포트 상세에 포함되는 문서 정보 타입
export interface DocumentInfo {
  productId: string
  productName: string | null
  productSpecs: string | null
}

// 리포트 상세용 신규 타입
export interface RetrievedDocument {
  rank: number
  productId: string
  productName: string | null
  productSpecs: string | null
  gain: number // 2 | 1 | 0
  isRelevant: boolean
}

export interface GroundTruthDocument {
  productId: string
  productName: string | null
  productSpecs: string | null
  score: number // 2 | 1 | 0 | -1 | -100
}