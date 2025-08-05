import { apiClient } from '../common/api-client'
import type {
  SearchLogPageResponse,
  SearchLogParams
} from './types'

class SearchLogService {
  private readonly baseEndpoint = '/v1/search-logs'

  // 검색 로그 목록 조회
  async getList(params: SearchLogParams = {}): Promise<SearchLogPageResponse> {
    return apiClient.get<SearchLogPageResponse>(this.baseEndpoint, params)
  }

}

export const searchLogService = new SearchLogService() 