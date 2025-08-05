import { apiClient } from '../common/api-client'
import type {
  SearchLogPageResponse,
  SearchLogParams,
  PopularKeywordsResponse,
  TrendingKeywordsResponse,
  AutocompleteResponse,
  SearchLogSummary,
  CreateSearchLogRequest,
  CreateSearchLogResponse
} from './types'

class SearchLogService {
  private readonly baseEndpoint = '/v1/search-logs'

  // 검색 로그 목록 조회
  async getList(params: SearchLogParams = {}): Promise<SearchLogPageResponse> {
    return apiClient.get<SearchLogPageResponse>(this.baseEndpoint, params)
  }

  // 인기 검색어 조회
  async getPopularKeywords(params?: { from?: string; to?: string; limit?: number }): Promise<PopularKeywordsResponse> {
    return apiClient.get<PopularKeywordsResponse>(`${this.baseEndpoint}/popular-keywords`, params)
  }

  // 급상승 검색어 조회
  async getTrendingKeywords(params?: { from?: string; to?: string; limit?: number }): Promise<TrendingKeywordsResponse> {
    return apiClient.get<TrendingKeywordsResponse>(`${this.baseEndpoint}/trending-keywords`, params)
  }

  // 검색어 자동완성
  async getAutocomplete(keyword: string, limit?: number): Promise<AutocompleteResponse> {
    return apiClient.get<AutocompleteResponse>(`${this.baseEndpoint}/autocomplete`, { keyword, limit })
  }

  // 검색 로그 통계 요약
  async getSummary(params?: { from?: string; to?: string }): Promise<SearchLogSummary> {
    return apiClient.get<SearchLogSummary>(`${this.baseEndpoint}/summary`, params)
  }

  // 검색 로그 등록 (내부용)
  async create(data: CreateSearchLogRequest): Promise<CreateSearchLogResponse> {
    return apiClient.post<CreateSearchLogResponse>(this.baseEndpoint, data)
  }

}

export const searchLogService = new SearchLogService() 