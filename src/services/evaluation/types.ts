
// 쿼리 관련 타입 (실제 백엔드 응답 구조에 맞게 수정)
export interface EvaluationQuery {
  id: number
  query: string
  documentCount: number
  score2Count: number
  score1Count: number
  score0Count: number
  scoreMinus1Count: number
  unevaluatedCount: number
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

// 관련성 상태 enum (실제 백엔드에 맞게) - DEPRECATED: score로 대체됨
export type RelevanceStatus = 'UNSPECIFIED' | 'RELEVANT' | 'IRRELEVANT'

// 문서 관련 타입 (백엔드 ProductDocumentDto 매핑)
export interface EvaluationDocument {
  id: number
  productId: string
  productName: string
  productSpecs: string
  productCategory?: string // 상품 카테고리
  relevanceScore: number | null  // 2, 1, 0, -1, null
  evaluationReason: string
  confidence?: number | null // 0.0 ~ 1.0, NULL if not evaluated
  expandedSynonyms?: string[] // 동의어 확장 결과
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
  taskType: 'QUERY_GENERATION' | 'CANDIDATE_GENERATION' | 'LLM_EVALUATION' | 'EVALUATION_EXECUTION'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  progress: number
  message: string
  errorMessage?: string | null
  result?: any  // 평가 결과 객체 포함 가능
  createdAt: string
  startedAt?: string
  completedAt?: string
}

// 평가 실행 결과 타입
export interface EvaluationExecutionResult {
  reportName: string
  reportId: number
  totalQueries: number
  recall300: number
  ndcg20: number
}

export interface UpdateCandidateRequest {
  relevanceScore: number | null  // -1 ~ 2
  evaluationReason?: string  // 선택사항
  confidence?: number  // 0.0 ~ 1.0, 선택사항 (기본값 1.0)
}

// 평가 관련 타입
export interface EvaluationRequest {
  reportName: string
  retrievalSize?: number
}



export interface QueryEvaluationDetail {
  query: string
  relevantCount: number
  retrievedCount: number
  correctCount: number
  ndcgAt20?: number  // 쿼리별 nDCG@20
  recallAt300?: number  // 쿼리별 Recall@300
  missingDocuments: DocumentInfo[]
  wrongDocuments: DocumentInfo[]
}

// 평가 실행 응답 (execute API)
export interface EvaluationExecuteResponse {
  reportId: number
  reportName: string
  recall: number
  precision: number
  ndcg: number
  totalQueries: number
  totalRelevantDocuments: number
  totalRetrievedDocuments: number
  totalCorrectDocuments: number
  queryDetails: QueryEvaluationDetail[]
}

// 리포트 상세 조회 응답
export interface EvaluationReport {
  id: number
  reportName: string
  totalQueries: number
  averageRecall300: number  // Recall@300
  averageNdcg20: number  // nDCG@20
  averagePrecision?: number  // 기존 호환성
  averageRecall?: number  // 기존 호환성
  averageNdcg?: number  // 기존 호환성
  totalRelevantDocuments?: number
  totalRetrievedDocuments?: number
  totalCorrectDocuments?: number
  createdAt: string
  queryDetails: QueryEvaluationDetail[]
}

export interface EvaluationReportSummary {
  id: number
  reportName: string
  totalQueries: number
  averageNdcg20: number  // nDCG@20
  averageRecall300: number  // Recall@300
  averageNdcg?: number  // 기존 호환성
  totalRelevantDocuments?: number
  totalRetrievedDocuments?: number
  totalCorrectDocuments?: number
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

// 리포트 상세용 신규 타입 - API에서 제거됨
// export interface RetrievedDocument {
//   position: number // 0부터 시작
//   productId: string
//   productName: string | null
//   productSpecs: string | null
//   relevanceScore: number // 2 | 1 | 0
//   isRelevant: boolean
// }

// export interface GroundTruthDocument {
//   productId: string
//   productName: string | null
//   productSpecs: string | null
//   relevanceScore: number | null // 2 | 1 | 0 | -1 | null (미평가)
// }