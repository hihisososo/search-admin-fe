import { apiClient } from '@/lib/api'
import type { DictionaryEnvironmentType } from '@/types/dashboard'

// 타입 정의
export interface CategoryMapping {
  category: string
  weight: number
}

export interface CategoryRankingDictionaryListItem {
  id: number
  keyword: string
  categoryCount: number
  description?: string
  updatedAt: string
  createdAt?: string
}

export interface CategoryRankingDictionaryDetail {
  id: number
  keyword: string
  categoryMappings: CategoryMapping[]
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CategoryRankingDictionaryCreateRequest {
  keyword: string
  categoryMappings: CategoryMapping[]
  description?: string
}

export interface CategoryRankingDictionaryUpdateRequest {
  keyword: string
  categoryMappings: CategoryMapping[]
  description?: string
}

export interface PageRequest {
  page?: number
  size?: number
  search?: string
  sortBy?: 'keyword' | 'createdAt' | 'updatedAt'
  sortDir?: 'asc' | 'desc'
  environment: DictionaryEnvironmentType
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface RealtimeSyncResponse {
  success: boolean
  message: string
  environment: string
  timestamp: number
}

export interface CategoriesResponse {
  totalCount: number
  categories: string[]
}

class CategoryRankingService {
  private baseUrl = '/v1/dictionaries/category-rankings'

  // 목록 조회
  async getList(params: PageRequest): Promise<PageResponse<CategoryRankingDictionaryListItem>> {
    const { page = 0, size = 20, search, sortBy = 'updatedAt', sortDir = 'desc', environment } = params
    
    return apiClient.get(this.baseUrl, {
      page,
      size,
      search,
      sortBy,
      sortDir,
      environment
    })
  }

  // 상세 조회
  async getById(id: number, environment?: DictionaryEnvironmentType): Promise<CategoryRankingDictionaryDetail> {
    return apiClient.get(`${this.baseUrl}/${id}`, { environment })
  }

  // 키워드로 조회
  async getByKeyword(keyword: string, environment?: DictionaryEnvironmentType): Promise<CategoryRankingDictionaryDetail> {
    return apiClient.get(`${this.baseUrl}/by-keyword/${keyword}`, { environment })
  }

  // 생성
  async create(data: CategoryRankingDictionaryCreateRequest, environment: DictionaryEnvironmentType = 'CURRENT'): Promise<CategoryRankingDictionaryDetail> {
    return apiClient.post(this.baseUrl, data, { environment })
  }

  // 수정
  async update(id: number, data: CategoryRankingDictionaryUpdateRequest, environment: DictionaryEnvironmentType = 'CURRENT'): Promise<CategoryRankingDictionaryDetail> {
    return apiClient.put(`${this.baseUrl}/${id}`, data, { environment })
  }

  // 삭제
  async delete(id: number, environment: DictionaryEnvironmentType = 'CURRENT'): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`, { environment })
  }

  // 카테고리 목록 조회
  async getCategories(environment?: DictionaryEnvironmentType): Promise<CategoriesResponse> {
    return apiClient.get(`${this.baseUrl}/categories`, { environment })
  }

  // 실시간 동기화
  async realtimeSync(environment: DictionaryEnvironmentType): Promise<RealtimeSyncResponse> {
    return apiClient.post(`${this.baseUrl}/realtime-sync`, null, { environment })
  }

  // 동기화 상태 조회
  async getSyncStatus(): Promise<any> {
    return apiClient.get(`${this.baseUrl}/sync-status`)
  }
}

export const categoryRankingService = new CategoryRankingService()