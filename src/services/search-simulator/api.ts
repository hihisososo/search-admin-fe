import { apiClient } from '@/services/common/api-client'

export const searchSimulatorService = {
  // 문서 직접 조회 API
  getDocument: async (documentId: string, environmentType: string = 'DEV'): Promise<any> => {
    return await apiClient.get(`/v1/search/document/${documentId}`, {
      environmentType
    })
  }
}