import type { PageResponse, SearchParams, DateRangeParams } from '../common/types'

// 검색 로그 아이템
export interface SearchLogItem {
  id: string
  timestamp: string
  searchKeyword: string
  indexName: string
  responseTimeMs: number
  resultCount: number
  clientIp: string
  userAgent: string
  isError: boolean
  errorMessage?: string
  searchSessionId?: string
  searchParams?: {
    size: number
    page: number
    filters: Record<string, string[]>
    sort: {
      sortType: string
      sortOrder: string
    }
  }
}

// 검색 로그 페이지 응답
export interface SearchLogPageResponse extends PageResponse<SearchLogItem> {
  currentPage: number
  hasNext: boolean
  hasPrevious: boolean
}

// 검색 로그 상세 응답 (목록 아이템과 동일 필드 가정)
export interface SearchLogResponse extends SearchLogItem {}


// 검색 로그 파라미터
export interface SearchLogParams extends SearchParams, DateRangeParams {
  keyword?: string
  indexName?: string
  isError?: boolean
  clientIp?: string
  minResponseTime?: number
  maxResponseTime?: number
  minResultCount?: number
  maxResultCount?: number
  // sort 필드는 SearchParams에서 상속받음 (string 타입)
  searchSessionId?: string
}

// 정렬 필드 및 방향
export type SearchLogSortField = 'timestamp' | 'responseTime' | 'resultCount' | 'searchKeyword'
export type SearchLogSortDirection = 'asc' | 'desc'

// 인기 검색어 아이템
export interface PopularKeywordItem {
  rank: number
  keyword: string
  searchCount: number
  percentage: number
  previousRank: number
  rankChange: number
}

// 인기 검색어 응답
export interface PopularKeywordsResponse {
  keywords: PopularKeywordItem[]
  totalSearches: number
  period: {
    from: string
    to: string
  }
}

// 급상승 검색어 아이템
export interface TrendingKeywordItem {
  rank: number
  keyword: string
  currentCount: number
  previousCount: number
  growthRate: number
  velocity: number
}

// 급상승 검색어 응답
export interface TrendingKeywordsResponse {
  keywords: TrendingKeywordItem[]
  period: {
    current: {
      from: string
      to: string
    }
    previous: {
      from: string
      to: string
    }
  }
}

// 자동완성 아이템
export interface AutocompleteSuggestion {
  keyword: string
  searchCount: number
  lastSearched: string
}

// 자동완성 응답
export interface AutocompleteResponse {
  suggestions: AutocompleteSuggestion[]
}

// 검색 로그 통계 요약
export interface SearchLogSummary {
  summary: {
    totalSearches: number
    uniqueKeywords: number
    averageResponseTime: number
    errorRate: number
    zeroResultRate: number
    averageResultCount: number
  }
  topSearchHours: Array<{
    hour: number
    searchCount: number
  }>
  searchByIndexName: Record<string, number>
}

// 검색 로그 등록 요청
export interface CreateSearchLogRequest {
  searchKeyword: string
  indexName: string
  clientIp: string
  userAgent: string
  responseTimeMs: number
  resultCount: number
  isError: boolean
  errorMessage?: string
  searchSessionId?: string
  searchParams: {
    size: number
    page: number
    filters: Record<string, string[]>
    sort: {
      sortType: string
      sortOrder: string
    }
  }
}

// 검색 로그 등록 응답
export interface CreateSearchLogResponse {
  id: string
  timestamp: string
  message: string
} 