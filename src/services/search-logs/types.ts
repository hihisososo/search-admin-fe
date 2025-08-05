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
}

// 검색 로그 페이지 응답
export interface SearchLogPageResponse extends PageResponse<SearchLogItem> {
  currentPage: number
  hasNext: boolean
  hasPrevious: boolean
}


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
  sort?: SearchLogSortField
  order?: SearchLogSortDirection
}

// 정렬 필드 및 방향
export type SearchLogSortField = 'timestamp' | 'responseTime' | 'resultCount' | 'searchKeyword'
export type SearchLogSortDirection = 'asc' | 'desc' 