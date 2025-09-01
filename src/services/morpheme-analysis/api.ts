import { apiClient } from "@/services/common/api-client"
import type { MorphemeAnalysisRequest, MorphemeAnalysisResponse, QueryAnalysisResponse, TokenInfo } from "./types"

// 형태소 분석 서비스
export const morphemeAnalysisService = {
  // 쿼리 분석
  analyzeQuery: async (params: { query: string; environment: string }): Promise<QueryAnalysisResponse> => {
    const request: MorphemeAnalysisRequest = {
      query: params.query,
      environment: params.environment
    }
    
    const data = await apiClient.post<MorphemeAnalysisResponse>(
      '/v1/search/query-analysis',
      request
    )
    
    // 응답 변환 (synonymExpansions 추가)
    const synonymExpansions: Record<string, string[]> = {}
    
    // synonymPaths를 synonymExpansions 형태로 변환
    if (data.noriAnalysis.synonymPaths && data.noriAnalysis.synonymPaths.length > 0) {
      // 간단한 변환: 모든 동의어를 하나의 그룹으로 처리
      const uniqueSynonyms = [...new Set(data.noriAnalysis.synonymPaths)]
      data.noriAnalysis.tokens.forEach((token: TokenInfo) => {
        if (token.type === 'SYNONYM') {
          synonymExpansions[token.token] = uniqueSynonyms.filter((s: string) => s !== token.token)
        }
      })
    }
    
    return {
      ...data,
      noriAnalysis: {
        ...data.noriAnalysis,
        synonymExpansions
      }
    }
  },

  // 임시 인덱스 갱신 (CURRENT 환경용)
  refreshTempIndex: async (): Promise<{ message: string }> => {
    await apiClient.post('/v1/search/temp-index/refresh', {})
    return { message: '인덱스가 갱신되었습니다.' }
  }
}