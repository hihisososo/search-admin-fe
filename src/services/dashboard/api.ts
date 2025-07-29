import { apiClient } from '../common/api-client'
import type {
  DashboardStats,
  PopularKeywordsResponse,
  TrendingKeywordsResponse,
  TrendsResponse,
  IndexDistributionResponse,
  DashboardApiParams
} from './types'

class DashboardService {
  private readonly baseEndpoint = '/v1'

  // 기본 통계 조회
  async getStats(params: DashboardApiParams = {}): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>(`${this.baseEndpoint}/stats`, params)
  }

  // 인기검색어 조회
  async getPopularKeywords(params: DashboardApiParams = {}): Promise<PopularKeywordsResponse> {
    return apiClient.get<PopularKeywordsResponse>(`${this.baseEndpoint}/stats/popular-keywords`, params)
  }

  // 급등검색어 조회
  async getTrendingKeywords(params: DashboardApiParams = {}): Promise<TrendingKeywordsResponse> {
    return apiClient.get<TrendingKeywordsResponse>(`${this.baseEndpoint}/stats/trending-keywords`, params)
  }

  // 시계열 추이 조회
  async getTrends(params: DashboardApiParams = {}): Promise<TrendsResponse> {
    return apiClient.get<TrendsResponse>(`${this.baseEndpoint}/stats/trends`, params)
  }

  // 인덱스별 분포 조회
  async getIndexDistribution(params: Omit<DashboardApiParams, 'indexName' | 'limit' | 'interval'> = {}): Promise<IndexDistributionResponse> {
    return apiClient.get<IndexDistributionResponse>(`${this.baseEndpoint}/stats/index-distribution`, params)
  }
}

export const dashboardService = new DashboardService() 