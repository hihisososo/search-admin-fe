import { apiClient } from '../common/api-client'
import type { Environment } from '../common/types'
import type {
  DictionaryPageResponse,
  DictionarySearchParams,
  SynonymDictionaryItem,
  TypoCorrectionDictionaryItem,
  StopwordDictionaryItem,
  UserDictionaryItem,
  UnitDictionaryItem,
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

  async getById(id: number, environment?: Environment): Promise<T> {
    const url = environment ? `${this.endpoint}/${id}?environment=${environment}` : `${this.endpoint}/${id}`
    return apiClient.get<T>(url)
  }

  async create(data: CreateReq, environment?: Environment): Promise<T> {
    const url = environment ? `${this.endpoint}?environment=${environment}` : this.endpoint
    return apiClient.post<T>(url, data)
  }

  async update(id: number, data: UpdateReq, environment?: Environment): Promise<T> {
    const url = environment ? `${this.endpoint}/${id}?environment=${environment}` : `${this.endpoint}/${id}`
    return apiClient.put<T>(url, data)
  }

  async delete(id: number, environment?: Environment): Promise<void> {
    const url = environment ? `${this.endpoint}/${id}?environment=${environment}` : `${this.endpoint}/${id}`
    return apiClient.delete<void>(url)
  }

  async bulkDelete(ids: number[], environment?: Environment): Promise<void> {
    if (!ids || ids.length === 0) return
    // 백엔드에서 bulk 삭제 미지원: 개별 삭제 반복 수행
    for (const id of ids) {
      await this.delete(id as number, environment)
    }
  }

  async download(): Promise<Blob> {
    return apiClient.getBlob(`${this.endpoint}/download`)
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
  protected readonly endpoint = '/v1/dictionaries/synonyms'

  // 실시간 동기화
  async realtimeSync(environment: Environment): Promise<RealtimeSyncResponse> {
    return apiClient.post<RealtimeSyncResponse>(`${this.endpoint}/realtime-sync?environment=${environment}`)
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
  protected readonly endpoint = '/v1/dictionaries/typos'

  // 실시간 동기화
  async realtimeSync(environment: Environment): Promise<RealtimeSyncResponse> {
    return apiClient.post<RealtimeSyncResponse>(`${this.endpoint}/realtime-sync?environment=${environment}`)
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
  protected readonly endpoint = '/v1/dictionaries/stopwords'
}

// 사용자 사전 서비스
class UserDictionaryService extends BaseDictionaryService<
  UserDictionaryItem,
  CreateDictionaryRequest,
  UpdateDictionaryRequest
> {
  protected readonly endpoint = '/v1/dictionaries/users'

  // 형태소 분석
  async analyzeText(text: string, environment: Environment = 'DEV'): Promise<AnalyzeTextResponse> {
    return apiClient.post<AnalyzeTextResponse>(`${this.endpoint}/analyze?environment=${environment}`, { text })
  }
}

// 단위 사전 서비스
class UnitDictionaryService extends BaseDictionaryService<
  UnitDictionaryItem,
  CreateDictionaryRequest,
  UpdateDictionaryRequest
> {
  protected readonly endpoint = '/v1/dictionaries/units'

  // 실시간 동기화
  async realtimeSync(environment: Environment): Promise<RealtimeSyncResponse> {
    return apiClient.post<RealtimeSyncResponse>(`${this.endpoint}/realtime-sync?environment=${environment}`)
  }

  // 동기화 상태 조회
  async getSyncStatus(): Promise<SyncStatusResponse> {
    return apiClient.get<SyncStatusResponse>(`${this.endpoint}/sync-status`)
  }
}

// 사전 배포 서비스
class DictionaryDeployService {
  private readonly endpoint = '/v1/dictionaries/deploy'

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
export const unitDictionaryService = new UnitDictionaryService()
export const dictionaryDeployService = new DictionaryDeployService() 