import { apiClient } from '@/services/common/api-client'
import type { QueryAnalysisRequest, QueryAnalysisResponse, RefreshIndexResponse } from './types'

export const morphemeAnalysisService = {
  analyzeQuery: async (request: QueryAnalysisRequest): Promise<QueryAnalysisResponse> => {
    return await apiClient.post<QueryAnalysisResponse>('/v1/search/query-analysis', request)
  },

  refreshTempIndex: async (): Promise<RefreshIndexResponse> => {
    return await apiClient.post<RefreshIndexResponse>('/v1/search/temp-index/refresh')
  }
}