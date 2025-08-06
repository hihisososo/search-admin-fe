import { apiClient } from '../common/api-client'
import type { Environment } from '../common/types'
import type {
  DictionaryPageResponse,
  DictionarySearchParams,
  SynonymDictionaryItem,
  TypoCorrectionDictionaryItem,
  StopwordDictionaryItem,
  UserDictionaryItem,
  CreateDictionaryRequest,
  CreateTypoCorrectionRequest,
  UpdateDictionaryRequest,
  UpdateTypoCorrectionRequest,
  RealtimeSyncResponse,
  SyncStatusResponse,
  AnalyzeTextResponse
} from './types'

// 기본 사전 서비스 클래스
abstract class BaseDictionaryService<T, CreateReq, UpdateReq> {
  protected abstract readonly endpoint: string

  async getList(params: DictionarySearchParams = {}): Promise<DictionaryPageResponse<T>> {
    return apiClient.get<DictionaryPageResponse<T>>(this.endpoint, params)
  }

  async getById(id: number): Promise<T> {
    return apiClient.get<T>(`${this.endpoint}/${id}`)
  }

  async create(data: CreateReq): Promise<T> {
    return apiClient.post<T>(this.endpoint, data)
  }

  async update(id: number, data: UpdateReq): Promise<T> {
    return apiClient.put<T>(`${this.endpoint}/${id}`, data)
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}`)
  }

  async bulkDelete(ids: number[]): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/bulk`, { ids })
  }

  async download(): Promise<Blob> {
    const response = await fetch(`${this.endpoint}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    })
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`)
    }
    return response.blob()
  }

  async upload(file: File): Promise<{ message: string; totalCount: number; successCount: number; failCount: number }> {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post(`${this.endpoint}/upload`, formData)
  }
}

// 동의어 사전 서비스
class SynonymDictionaryService extends BaseDictionaryService<
  SynonymDictionaryItem,
  CreateDictionaryRequest,
  UpdateDictionaryRequest
> {
  protected readonly endpoint = '/api/v1/dictionaries/synonym'

  // 실시간 동기화
  async realtimeSync(environment: Environment): Promise<RealtimeSyncResponse> {
    return apiClient.post<RealtimeSyncResponse>(`${this.endpoint}/realtime-sync`, { environment })
  }

  // 동기화 상태 조회
  async getSyncStatus(): Promise<SyncStatusResponse> {
    return apiClient.get<SyncStatusResponse>(`${this.endpoint}/sync-status`)
  }
}

// 오타교정 사전 서비스
class TypoCorrectionDictionaryService extends BaseDictionaryService<
  TypoCorrectionDictionaryItem,
  CreateTypoCorrectionRequest,
  UpdateTypoCorrectionRequest
> {
  protected readonly endpoint = '/api/v1/dictionaries/typo'

  // 실시간 동기화
  async realtimeSync(environment: Environment): Promise<RealtimeSyncResponse> {
    return apiClient.post<RealtimeSyncResponse>(`${this.endpoint}/realtime-sync`, { environment })
  }

  // 동기화 상태 조회
  async getSyncStatus(): Promise<SyncStatusResponse> {
    return apiClient.get<SyncStatusResponse>(`${this.endpoint}/sync-status`)
  }
}

// 불용어 사전 서비스
class StopwordDictionaryService extends BaseDictionaryService<
  StopwordDictionaryItem,
  CreateDictionaryRequest,
  UpdateDictionaryRequest
> {
  protected readonly endpoint = '/api/v1/dictionaries/stopword'
}

// 사용자 사전 서비스
class UserDictionaryService extends BaseDictionaryService<
  UserDictionaryItem,
  CreateDictionaryRequest,
  UpdateDictionaryRequest
> {
  protected readonly endpoint = '/api/v1/dictionaries/user'

  // 형태소 분석
  async analyzeText(text: string, environment: Environment = 'DEV'): Promise<AnalyzeTextResponse> {
    return apiClient.post<AnalyzeTextResponse>(`${this.endpoint}/analyze?environment=${environment}`, { text })
  }
}

// 사전 배포 서비스
class DictionaryDeployService {
  private readonly endpoint = '/api/v1/dictionaries/deploy'

  async deployToDev(): Promise<{ message: string; deployedAt: string }> {
    return apiClient.post(`${this.endpoint}/dev`)
  }

  async deployToProd(): Promise<{ message: string; deployedAt: string }> {
    return apiClient.post(`${this.endpoint}/prod`)
  }
}

// 서비스 인스턴스들
export const synonymDictionaryService = new SynonymDictionaryService()
export const typoCorrectionDictionaryService = new TypoCorrectionDictionaryService()
export const stopwordDictionaryService = new StopwordDictionaryService()
export const userDictionaryService = new UserDictionaryService()
export const dictionaryDeployService = new DictionaryDeployService() 