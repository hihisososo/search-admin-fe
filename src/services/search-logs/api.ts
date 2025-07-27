import { apiClient } from '../common/api-client'
import type {
  SearchLogPageResponse,
  SearchLogFilterOptions,
  SearchLogParams
} from './types'

class SearchLogService {
  private readonly baseEndpoint = '/api/v1/search-logs'

  // 검색 로그 목록 조회
  async getList(params: SearchLogParams = {}): Promise<SearchLogPageResponse> {
    return apiClient.get<SearchLogPageResponse>(this.baseEndpoint, params)
  }

  // 필터 옵션 조회
  async getFilterOptions(): Promise<SearchLogFilterOptions> {
    return apiClient.get<SearchLogFilterOptions>(`${this.baseEndpoint}/filter-options`)
  }
}

export const searchLogService = new SearchLogService() 