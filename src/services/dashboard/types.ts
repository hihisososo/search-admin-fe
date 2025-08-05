import type { DateRangeParams } from '../common/types'

// 대시보드 통계 (API 명세서 기준)
export interface DashboardStats {
  totalSearches: number
  averageResponseTime: number
  errorRate: number
  uniqueUsers: number
  searchVolumeByTime: Array<{
    time: string
    count: number
  }>
}

// 인기 키워드 아이템 (대시보드용)
export interface PopularKeywordItem {
  keyword: string
  count: number
  rank: number
}

// 급등 키워드 아이템 (대시보드용)
export interface TrendingKeywordItem {
  keyword: string
  count: number
  growthRate: number
  rank: number
}

// 인기 키워드 응답
export interface PopularKeywordsResponse {
  keywords: PopularKeywordItem[]
  totalCount: number
}

// 급등 키워드 응답
export interface TrendingKeywordsResponse {
  keywords: TrendingKeywordItem[]
  totalCount: number
}

// 트렌드 데이터 포인트
export interface TrendDataPoint {
  timestamp: string
  searchCount: number
  clickCount: number
  errorCount: number
}

// 트렌드 응답
export interface TrendsResponse {
  trends: TrendDataPoint[]
  summary: {
    totalSearches: number
    totalClicks: number
    averageCTR: number
  }
}

// 대시보드 API 파라미터
export interface DashboardApiParams extends DateRangeParams {
  limit?: number
  interval?: 'hour' | 'day'
  [key: string]: string | number | boolean | undefined
}

// UI용 통계 아이템
export interface StatItem {
  label: string
  value: number | string
}

// 이전 버전과의 호환성을 위한 타입 (deprecated)
export interface KeywordItem extends PopularKeywordItem {
  searchCount?: number
  previousRank?: number | null
  rankChange?: number | null
  changeStatus?: "UP" | "DOWN" | "NEW" | "SAME"
  percentage?: number
  clickCount?: number
  clickThroughRate?: number
}