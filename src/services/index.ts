// 공통 타입 및 클라이언트
export * from './common/types'
export * from './common/api-client'

// 대시보드 서비스
export * from './dashboard/types'
export { dashboardService } from './dashboard/api'

// 사전 관리 서비스
export * from './dictionary/types'
export {
  synonymDictionaryService,
  typoCorrectionDictionaryService,
  stopwordDictionaryService,
  userDictionaryService,
  realtimeSyncService
} from './dictionary/api'

// 검색 로그 서비스
export * from './search-logs/types'
export { searchLogService } from './search-logs/api'

// 검색 평가 서비스
export * from './evaluation/types'
export { evaluationService } from './evaluation/api'

// 클릭 로그 서비스
export * from './click-logs/types'
export { clickLogService } from './click-logs/api'

// 하위 호환성을 위한 기존 API 별칭들
export { dashboardService as dashboardApi } from './dashboard/api'
export { 
  synonymDictionaryService as synonymDictionaryApi,
  typoCorrectionDictionaryService as typoCorrectionDictionaryApi,
  stopwordDictionaryService as stopwordDictionaryApi,
  userDictionaryService as userDictionaryApi,
  realtimeSyncService as realtimeSyncApi
} from './dictionary/api'
export { searchLogService as searchLogApi } from './search-logs/api'
export { evaluationService as evaluationApi } from './evaluation/api'
export { clickLogService as clickLogApi } from './click-logs/api' 