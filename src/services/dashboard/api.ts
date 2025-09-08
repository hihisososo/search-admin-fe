import { apiClient } from '../common/api-client'
import type {
  DashboardStats,
  PopularKeywordsResponse,
  TrendingKeywordsResponse,
  TrendsResponse,
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
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    const formatDateTime = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
    }
    
    const finalParams = {
      ...params,
      from: formatDateTime(yesterday),
      to: formatDateTime(now)
    }
    
    return apiClient.get<PopularKeywordsResponse>(`${this.baseEndpoint}/stats/popular-keywords`, finalParams)
  }

  // 급등검색어 조회
  async getTrendingKeywords(params: DashboardApiParams = {}): Promise<TrendingKeywordsResponse> {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    const formatDateTime = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
    }
    
    const finalParams = {
      ...params,
      from: formatDateTime(yesterday),
      to: formatDateTime(now)
    }
    
    return apiClient.get<TrendingKeywordsResponse>(`${this.baseEndpoint}/stats/trending-keywords`, finalParams)
  }

  // 시계열 추이 조회
  async getTrends(params: DashboardApiParams = {}): Promise<TrendsResponse> {
    return apiClient.get<TrendsResponse>(`${this.baseEndpoint}/stats/trends`, params)
  }

}

export const dashboardService = new DashboardService() 