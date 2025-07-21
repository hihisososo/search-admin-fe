// API 명세에 맞는 새로운 타입 정의

// 환경 정보
export interface Environment {
  environmentType: 'DEV' | 'PROD'
  environmentDescription: string
  indexName: string
  documentCount: number
  indexStatus: 'ACTIVE' | 'INACTIVE' | 'INDEXING' | 'FAILED'
  indexStatusDescription: string
  indexDate: string
  version: string
  isIndexing: boolean
}

// 배포 이력
export interface DeployHistory {
  id: number
  deploymentType: 'INDEXING' | 'DEPLOYMENT'
  deploymentTypeDescription: string
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS'
  statusDescription: string
  version: string
  documentCount: number
  description: string
  deploymentTime: string
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
  version: string | null
  historyId: number | null
}

// 환경 목록 응답
export interface EnvironmentsResponse {
  environments: Environment[]
  totalCount: number
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
  sort?: string
  status?: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS'
  deploymentType?: 'INDEXING' | 'DEPLOYMENT'
} 