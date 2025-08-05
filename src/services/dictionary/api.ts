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
  SyncStatusResponse
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
}

// 동의어 사전 서비스
class SynonymDictionaryService extends BaseDictionaryService<
  SynonymDictionaryItem,
  CreateDictionaryRequest,
  UpdateDictionaryRequest
> {
  protected readonly endpoint = '/v1/dictionaries/synonyms'
}

// 오타교정 사전 서비스
class TypoCorrectionDictionaryService extends BaseDictionaryService<
  TypoCorrectionDictionaryItem,
  CreateTypoCorrectionRequest,
  UpdateTypoCorrectionRequest
> {
  protected readonly endpoint = '/v1/dictionaries/typo-corrections'

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
  protected readonly endpoint = '/v1/dictionaries/stopwords'
}

// 사용자 사전 서비스
class UserDictionaryService extends BaseDictionaryService<
  UserDictionaryItem,
  CreateDictionaryRequest,
  UpdateDictionaryRequest
> {
  protected readonly endpoint = '/v1/dictionaries/user'
}

// 실시간 동기화 서비스
class RealtimeSyncService {
  private readonly baseEndpoint = '/v1/dictionaries/realtime-sync'

  // 동의어 사전 실시간 반영
  async syncSynonym(environment: Environment): Promise<RealtimeSyncResponse> {
    return apiClient.post<RealtimeSyncResponse>(`${this.baseEndpoint}/synonym`, { environment })
  }

  // 오타교정 사전 실시간 반영
  async syncTypoCorrection(environment: Environment): Promise<RealtimeSyncResponse> {
    return apiClient.post<RealtimeSyncResponse>(`${this.baseEndpoint}/typo`, { environment })
  }

  // 모든 사전 실시간 반영
  async syncAll(environment: Environment): Promise<RealtimeSyncResponse> {
    return apiClient.post<RealtimeSyncResponse>(`${this.baseEndpoint}/all`, { environment })
  }

  // 동기화 상태 조회
  async getStatus(): Promise<SyncStatusResponse> {
    return apiClient.get<SyncStatusResponse>(`${this.baseEndpoint}/status`)
  }
}

// 서비스 인스턴스들
export const synonymDictionaryService = new SynonymDictionaryService()
export const typoCorrectionDictionaryService = new TypoCorrectionDictionaryService()
export const stopwordDictionaryService = new StopwordDictionaryService()
export const userDictionaryService = new UserDictionaryService()
export const realtimeSyncService = new RealtimeSyncService() 