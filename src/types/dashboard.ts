// 🔄 DEPRECATED: 이 파일의 타입들은 @/services로 이전되었습니다.
// 하위 호환성을 위해 re-export합니다.

export type {
  StatItem,
  DashboardStats,
  KeywordItem,
  PopularKeywordsResponse,
  TrendingKeywordsResponse,
  TrendDataPoint,
  TrendsResponse,
  IndexDistributionItem,
  IndexDistributionResponse,
  DashboardApiParams
} from '@/services/dashboard/types'

// 🔄 DEPRECATED: 사전 관리 타입들도 @/services로 이전되었습니다.
export type {
  DictionaryItem,
  DictionaryPageResponse,
  DictionarySortField,
  DictionarySortDirection,
  SynonymDictionaryItem,
  TypoCorrectionDictionaryItem,
  StopwordDictionaryItem,
  UserDictionaryItem
} from '@/services/dictionary/types'

export { Environment as DictionaryEnvironmentType } from '@/services/common/types'

// 환경별 표시 정보 (UI 전용)
export const ENVIRONMENT_LABELS = {
  CURRENT: {
    label: '현재 (편집용)',
    color: 'bg-blue-500'
  },
  DEV: {
    label: '개발환경',
    color: 'bg-green-500'
  },
  PROD: {
    label: '운영환경',
    color: 'bg-gray-800'
  }
} as const 

// 🔄 DEPRECATED: 검색 로그 타입들도 @/services로 이전되었습니다.
export type {
  SearchLogItem,
  SearchLogPageResponse,
  SearchLogFilterOptions,
  SearchLogParams,
  SearchLogSortField,
  SearchLogSortDirection
} from '@/services/search-logs/types' 