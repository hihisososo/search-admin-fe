import { apiClient } from "@/services/common/api-client"
import type { MorphemeAnalysisRequest, QueryAnalysisResponse, IndexAnalysisResponse } from "./types"

// 형태소 분석 서비스
export const morphemeAnalysisService = {
  // 검색용 쿼리 분석
  analyzeQuery: async (params: { query: string; environment: string }): Promise<QueryAnalysisResponse> => {
    const request: MorphemeAnalysisRequest = {
      query: params.query,
      environment: params.environment
    }
    
    const response = await apiClient.post<QueryAnalysisResponse>(
      '/v1/search/query-analysis',
      request
    )
    
    // 직접 반환 (변환 불필요)
    return response
  },

  // 색인용 쿼리 분석
  analyzeIndexQuery: async (params: { query: string; environment: string }): Promise<IndexAnalysisResponse> => {
    const request: MorphemeAnalysisRequest = {
      query: params.query,
      environment: params.environment
    }
    
    const response = await apiClient.post<IndexAnalysisResponse>(
      '/v1/search/index-analysis',
      request
    )
    
    return response
  },

  // 임시 인덱스 갱신 (CURRENT 환경용)
  refreshTempIndex: async (): Promise<{ status: string; message: string; indexName?: string }> => {
    const response = await apiClient.post<{ status: string; message: string; indexName?: string }>(
      '/v1/search/temp-index/refresh', 
      {}
    )
    return response
  }
}