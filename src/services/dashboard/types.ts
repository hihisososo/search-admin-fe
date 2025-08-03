import type { DateRangeParams } from '../common/types'

// 대시보드 통계
export interface DashboardStats {
  totalSearchCount: number
  totalDocumentCount: number
  searchFailureRate: number
  errorCount: number
  averageResponseTimeMs: number
  successRate: number
  clickCount: number
  clickThroughRate: number
  period: string
  indexName?: string
}

// 키워드 아이템
export interface KeywordItem {
  keyword: string
  searchCount: number
  rank: number
  previousRank: number | null
  rankChange: number | null
  changeStatus: "UP" | "DOWN" | "NEW" | "SAME"
  count?: number
  percentage?: number
  clickCount?: number
  clickThroughRate?: number
}

// 인기 키워드 응답
export interface PopularKeywordsResponse {
  keywords: KeywordItem[]
  period: string
  indexName?: string
}

// 급등 키워드 응답
export interface TrendingKeywordsResponse {
  keywords: KeywordItem[]
  period: string
  indexName?: string
}

// 트렌드 데이터 포인트
export interface TrendDataPoint {
  timestamp: string
  searchCount: number
  averageResponseTime: number
  label: string
  clickCount?: number
  clickThroughRate?: number
}

// 트렌드 응답
export interface TrendsResponse {
  searchVolumeData: TrendDataPoint[]
  responseTimeData: TrendDataPoint[]
  period: string
  indexName?: string
  interval: string
}

// 인덱스 분포 아이템
export interface IndexDistributionItem {
  indexName: string
  searchCount: number
  percentage: number
  averageResponseTime: number
  errorCount: number
  successRate: number
  clickCount?: number
  clickThroughRate?: number
}

// 인덱스 분포 응답
export interface IndexDistributionResponse {
  indices: IndexDistributionItem[]
  period: string
  totalSearchCount: number
}

// 대시보드 API 파라미터
export interface DashboardApiParams extends DateRangeParams {
  indexName?: string
  limit?: number
  interval?: 'hour' | 'day'
  [key: string]: string | number | boolean | undefined
}

// UI용 통계 아이템
export interface StatItem {
  label: string
  value: number | string
} 