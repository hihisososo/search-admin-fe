import type { DateRangeParams } from '../common/types'

// 대시보드 통계 - 백엔드 API 실제 응답
export interface DashboardStats {
  totalSearchCount: number
  totalDocumentCount: number
  zeroHitRate: number
  errorCount: number
  averageResponseTimeMs: number
  successRate: number
  clickCount: number
  clickThroughRate: number
  period: string
}

// 백엔드 API 명세서 기준 타입 (향후 사용 예정)
export interface FullDashboardStats {
  period: {
    from: string
    to: string
    timezone: string
    days: number
  }
  searchMetrics: {
    totalSearches: number
    uniqueSearches: number
    avgSearchesPerDay: number
    peakHour: string
    peakDay: string
  }
  performanceMetrics: {
    avgResponseTime: number
    medianResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    maxResponseTime: number
    timeoutRate: number
  }
  qualityMetrics: {
    errorRate: number
    zeroResultRate: number
    clickThroughRate: number
    bounceRate: number
    avgResultCount: number
    avgClickPosition: number
  }
  userBehavior: {
    avgSessionDuration: string
    avgSearchesPerSession: number
    refinementRate: number
    uniqueUsers: number
    newUserRate: number
  }
  topSearchedKeywords: Array<{
    keyword: string
    count: number
    percentage: number
    avgCtr: number
    avgResultCount: number
  }>
  errorBreakdown: Record<string, number>
  deviceBreakdown: Record<string, number>
}

// 인기 키워드 아이템 (대시보드용)
export interface PopularKeywordItem {
  keyword: string
  count: number
  clickCount: number
  clickThroughRate: number
  percentage: number
  rank: number
  previousRank: number | null
  rankChange: number | null
  changeStatus: 'UP' | 'DOWN' | 'NEW' | 'SAME'
}

// 급등 키워드 아이템 (대시보드용)
export interface TrendingKeywordItem {
  keyword: string
  count: number
  clickCount: number
  clickThroughRate: number
  percentage: number
  rank: number
  previousRank: number | null
  rankChange: number | null
  changeStatus: 'UP' | 'DOWN' | 'NEW' | 'SAME'
}

// 인기 키워드 응답
export interface PopularKeywordsResponse {
  keywords: PopularKeywordItem[]
  period: string
}

// 급등 키워드 응답
export interface TrendingKeywordsResponse {
  keywords: TrendingKeywordItem[]
  period: string
}

// 트렌드 데이터 포인트
export interface TrendDataPoint {
  timestamp: string
  searchCount: number
  clickCount: number
  clickThroughRate: number
  averageResponseTime: number
  label: string
}

// 트렌드 응답
export interface TrendsResponse {
  searchVolumeData: TrendDataPoint[]
  responseTimeData: TrendDataPoint[]
  period: string
  interval: string
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

// 차트 데이터 타입 정의
export interface ResponseTimeChartData {
  date: string
  responseTime: number
}

export interface SearchVolumeChartData {
  date: string
  searches: number
  successfulSearches: number
  failedSearches: number
}

// 이전 버전과의 호환성을 위한 타입 (deprecated)
export interface KeywordItem {
  keyword: string
  count: number
  searchCount?: number
  previousRank?: number | null
  rankChange?: number | null
  changeStatus?: "UP" | "DOWN" | "NEW" | "SAME"
  percentage?: number
  clickCount?: number
  clickThroughRate?: number
  rank?: number
}