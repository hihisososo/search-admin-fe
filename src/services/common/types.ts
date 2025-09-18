// 공통 API 응답 타입
export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  hasNext?: boolean
  hasPrevious?: boolean
}

// 페이지네이션 파라미터
export interface PageParams {
  page?: number
  size?: number
  sort?: string  // Spring Data format: "field,direction" (e.g., "updatedAt,desc")
  [key: string]: string | number | boolean | undefined
}

// 검색 파라미터
export interface SearchParams extends PageParams {
  search?: string
  keyword?: string
}

// 날짜 범위 파라미터
export interface DateRangeParams {
  from?: string
  to?: string
  startDate?: string
  endDate?: string
  [key: string]: string | number | boolean | undefined
}

// 환경 타입
export const Environment = {
  CURRENT: "CURRENT",
  DEV: "DEV", 
  PROD: "PROD"
} as const

export type Environment = typeof Environment[keyof typeof Environment]

// 집계 버킷
export interface AggregationBucket {
  key: string
  docCount: number
} 