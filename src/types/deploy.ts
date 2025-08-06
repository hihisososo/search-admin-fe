// API 명세에 맞는 새로운 타입 정의

// 환경 정보
export interface Environment {
  environmentType: 'DEV' | 'PROD'
  environmentDescription: string
  indexName: string
  autocompleteIndexName: string
  documentCount: number
  indexStatus: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'ACTIVE'
  indexStatusDescription: string
  indexDate: string
  version: string
  isIndexing: boolean
  indexingProgress?: number | null
  indexedDocumentCount?: number | null
  totalDocumentCount?: number | null
}

// 배포 이력
export interface DeployHistory {
  id: number
  deploymentType: 'INDEXING' | 'DEPLOYMENT'
  deploymentTypeDescription: string
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS'
  statusDescription: string
  version: string
  documentCount: number | null
  description: string
  deploymentTime: string | null
  createdAt: string
}

// API 요청 타입
export interface IndexingRequest {
  description?: string
}

export interface DeploymentRequest {
  description?: string
}

// API 응답 타입
export interface OperationResponse {
  success: boolean
  message: string
  operationType: 'INDEXING' | 'DEPLOYMENT'
  version: string | null
  environmentType: 'DEV' | 'PROD'
  timestamp: string
}

// 환경 목록 응답
export interface EnvironmentsResponse {
  environments: Environment[]
}

// 배포 이력 응답
export interface DeploymentHistoryResponse {
  deploymentHistories: DeployHistory[]
  pagination: {
    content: DeployHistory[]
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}

// 배포 이력 조회 파라미터
export interface DeploymentHistoryParams {
  page?: number
  size?: number
  sort?: string  // 유효한 필드: id, deploymentType, status, version, documentCount, description, deploymentTime, createdAt
                 // 예시: 'createdAt,desc' 또는 'id,asc'
  status?: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS'  // Query param은 SUCCESS 사용
  deploymentType?: 'INDEXING' | 'DEPLOYMENT'
} 