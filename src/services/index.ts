// 공통 타입 및 클라이언트
export { Environment, type PageParams } from './common/types'
export * from './common/api-client'

// Task 서비스 (비동기 작업 관리)
export * from './task/types'
export { taskService } from './task/api'

// 대시보드 서비스
export {
  type DashboardStats,
  type TrendsResponse,
  type PopularKeywordItem,
  type TrendingKeywordItem,
  type PopularKeywordsResponse,
  type TrendingKeywordsResponse,
  type KeywordItem,
  type StatItem,
  type DashboardApiParams
} from './dashboard/types'
export { dashboardService } from './dashboard/api'

// 사전 관리 서비스
export * from './dictionary/types'
export {
  synonymDictionaryService,
  typoCorrectionDictionaryService,
  stopwordDictionaryService,
  userDictionaryService,
  unitDictionaryService
} from './dictionary/api'

// 검색 로그 서비스
export {
  type SearchLogItem,
  type SearchLogParams,
  type SearchLogPageResponse,
  type PopularKeywordItem as SearchLogPopularKeywordItem,
  type TrendingKeywordItem as SearchLogTrendingKeywordItem,
  type PopularKeywordsResponse as SearchLogPopularKeywordsResponse,
  type TrendingKeywordsResponse as SearchLogTrendingKeywordsResponse
} from './search-logs/types'
export { searchLogService } from './search-logs/api'

// 검색 평가 서비스
export * from './evaluation/types'
export { evaluationService } from './evaluation/api'

// 클릭 로그 서비스
export * from './click-logs/types'
export { clickLogService } from './click-logs/api'

// 배포 관리 서비스
export * from './deployment/types'
export { deploymentService } from './deployment/api'

// 형태소분석 서비스
export * from './morpheme-analysis/types'
export { morphemeAnalysisService } from './morpheme-analysis/api' 