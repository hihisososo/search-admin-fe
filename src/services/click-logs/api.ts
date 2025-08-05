import { apiClient } from '../common/api-client'
import type { ClickLogRequest, ClickLogResponse } from './types'

class ClickLogService {
  private readonly baseEndpoint = '/v1/click-logs'

  // 클릭 로그 저장
  async saveClickLog(data: ClickLogRequest): Promise<ClickLogResponse> {
    return apiClient.post<ClickLogResponse>(this.baseEndpoint, data)
  }
}

export const clickLogService = new ClickLogService()