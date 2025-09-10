import { apiClient } from '../common/api-client'
import type {
  EnvironmentsResponse,
  OperationResponse,
  DeploymentHistoryResponse,
  IndexingRequest,
  IndexingTaskResponse,
  DeploymentRequest,
  DeploymentHistoryParams
} from './types'

class DeploymentService {
  private readonly baseEndpoint = '/v1/deployment'

  // 환경 정보 조회
  async getEnvironments(): Promise<EnvironmentsResponse> {
    return apiClient.get<EnvironmentsResponse>(`${this.baseEndpoint}/environments`)
  }

  // 색인 실행 (개발환경만) - Task 기반
  async executeIndexing(request: IndexingRequest = {}): Promise<IndexingTaskResponse> {
    return apiClient.post<IndexingTaskResponse>(`${this.baseEndpoint}/indexing`, request)
  }

  // 배포 실행
  async executeDeploy(request: DeploymentRequest = {}): Promise<OperationResponse> {
    return apiClient.post<OperationResponse>(`${this.baseEndpoint}/deploy`, request)
  }

  // 배포 이력 조회
  async getDeploymentHistory(params: DeploymentHistoryParams = {}): Promise<DeploymentHistoryResponse> {
    return apiClient.get<DeploymentHistoryResponse>(`${this.baseEndpoint}/history`, params as Record<string, string | number | boolean | string[] | undefined>)
  }
}

export const deploymentService = new DeploymentService()