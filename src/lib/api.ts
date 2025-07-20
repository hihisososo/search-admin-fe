import { logger } from './logger'
import { APIError, errorTracker } from './errorHandler'
import { config } from './config'
import type { 
  DashboardStats, 
  PopularKeywordsResponse, 
  TrendingKeywordsResponse, 
  TrendsResponse, 
  IndexDistributionResponse,
  DashboardApiParams 
} from '@/types/dashboard'

// 검색 관련 타입 정의
export interface Product {
  id: number
  name: string
  nameRaw: string
  brand: string
  category: string
  subCategory?: string
  price: number
  lowestPrice: number
  reviewCount: number
  rating: number
  thumbnailUrl: string
  description?: string
  descriptionRaw?: string
  registeredMonth?: string
}

export interface AggregationBucket {
  key: string
  docCount: number
}

export interface SearchRequest {
  query?: string
  page: number
  size: number
  sortField?: 'score' | 'price' | 'rating' | 'reviewCount' | 'name'
  sortOrder?: 'asc' | 'desc'
  brand?: string[]
  category?: string[]
  priceFrom?: number
  priceTo?: number
}

export interface SearchResponse {
  hits: {
    total: number
    data: Product[]
  }
  aggregations?: {
    brand?: AggregationBucket[]
    category?: AggregationBucket[]
  }
  meta: {
    page: number
    size: number
    totalPages: number
    processingTime: number
  }
}

export interface AutocompleteResponse {
  suggestions: string[]
  count: number
}

export interface PopularKeyword {
  keyword: string
  searchCount: number
  rank: number
}

export interface TrendingKeyword {
  keyword: string
  currentCount: number
  previousCount: number
  growthRate: number
  rank: number
}

export interface PopularKeywordsApiResponse {
  keywords: PopularKeyword[]
  fromDate: string
  toDate: string
  totalCount: number
  lastUpdated: string
}

export interface TrendingKeywordsApiResponse {
  keywords: TrendingKeyword[]
  currentFromDate: string
  currentToDate: string
  previousFromDate: string
  previousToDate: string
  totalCount: number
  lastUpdated: string
}

export interface RealtimeKeywordsResponse {
  keywords: PopularKeyword[]
  fromDate: string
  toDate: string
  totalCount: number
  lastUpdated: string
}

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  logger.debug('API 요청', { url, method: options.method || 'GET' })

  const API_BASE_URL = config.get('apiBaseUrl')
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
  
  const requestOptions: RequestInit = {
    ...options,
    headers: {
      // FormData인 경우 Content-Type을 설정하지 않음 (브라우저가 자동으로 boundary 설정)
      ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
  }

  try {
    const response = await fetch(fullUrl, requestOptions)
    
    if (!response.ok) {
      let errorMessage = 'API 오류'
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
        errorMessage = `HTTP ${response.status}: ${response.statusText}`
      }
      
      const apiError = new APIError(errorMessage, response.status)
      logger.error('API 에러', apiError)
      errorTracker.captureException(apiError)
      throw apiError
    }

    // 응답이 JSON인지 확인
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      logger.debug('API 성공', { url: fullUrl })
      return data
    } else {
      // JSON이 아닌 경우 (예: 파일 다운로드 등)
      const data = await response.text()
      logger.debug('API 성공 (텍스트)', { url: fullUrl })
      return data as T
    }

  } catch (error) {
    if (!(error instanceof APIError)) {
      // 네트워크 오류 등
      const networkError = new APIError(
        error instanceof Error ? error.message : '네트워크 오류가 발생했습니다',
        0
      )
      
      logger.error('네트워크 에러', networkError)
      errorTracker.captureException(networkError)
      throw networkError
    }
    
    throw error
  }
}

export async function apiFetchJson<T>(url: string, data: any, method: string = 'POST'): Promise<T> {
  return apiFetch<T>(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function apiFetchMultipart<T>(url: string, formData: FormData, method: string = 'POST'): Promise<T> {
  return apiFetch<T>(url, {
    method,
    body: formData,
  })
}

// 쿼리 파라미터를 URL에 추가하는 헬퍼 함수
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

// 대시보드 API 함수들
export const dashboardApi = {
  // 기본 통계 조회
  async getStats(params: DashboardApiParams = {}): Promise<DashboardStats> {
    const queryString = buildQueryString(params)
    return apiFetch<DashboardStats>(`/api/v1/stats${queryString}`)
  },

  // 인기검색어 조회
  async getPopularKeywords(params: DashboardApiParams = {}): Promise<PopularKeywordsResponse> {
    const queryString = buildQueryString(params)
    return apiFetch<PopularKeywordsResponse>(`/api/v1/stats/popular-keywords${queryString}`)
  },

  // 급등검색어 조회
  async getTrendingKeywords(params: DashboardApiParams = {}): Promise<TrendingKeywordsResponse> {
    const queryString = buildQueryString(params)
    return apiFetch<TrendingKeywordsResponse>(`/api/v1/stats/trending-keywords${queryString}`)
  },

  // 시계열 추이 조회
  async getTrends(params: DashboardApiParams = {}): Promise<TrendsResponse> {
    const queryString = buildQueryString(params)
    return apiFetch<TrendsResponse>(`/api/v1/stats/trends${queryString}`)
  },

  // 인덱스별 분포 조회
  async getIndexDistribution(params: Omit<DashboardApiParams, 'indexName' | 'limit' | 'interval'> = {}): Promise<IndexDistributionResponse> {
    const queryString = buildQueryString(params)
    return apiFetch<IndexDistributionResponse>(`/api/v1/stats/index-distribution${queryString}`)
  }
}

// 검색 API 함수들
export const searchApi = {
  // 자동완성
  async getAutocomplete(keyword: string): Promise<AutocompleteResponse> {
    const queryString = buildQueryString({ keyword })
    return apiFetch<AutocompleteResponse>(`/api/v1/search/autocomplete${queryString}`)
  },

  // 상품 검색 - GET 방식으로 변경
  async searchProducts(searchRequest: SearchRequest): Promise<SearchResponse> {
    const params = new URLSearchParams()
    
    // 필수 파라미터
    if (searchRequest.query) {
      params.set('query', searchRequest.query)
    }
    params.set('page', searchRequest.page.toString())
    params.set('size', searchRequest.size.toString())
    
    // 선택적 파라미터
    if (searchRequest.sortField) {
      params.set('sortField', searchRequest.sortField)
    }
    if (searchRequest.sortOrder) {
      params.set('sortOrder', searchRequest.sortOrder)
    }
    
    // 가격 범위
    if (searchRequest.priceFrom !== undefined) {
      params.set('priceFrom', searchRequest.priceFrom.toString())
    }
    if (searchRequest.priceTo !== undefined) {
      params.set('priceTo', searchRequest.priceTo.toString())
    }
    
    // 다중 값 파라미터들
    searchRequest.brand?.forEach(brand => {
      params.append('brand', brand)
    })
    searchRequest.category?.forEach(category => {
      params.append('category', category)
    })
    
    const queryString = params.toString()
    return apiFetch<SearchResponse>(`/api/v1/search?${queryString}`)
  },

  // 인기 검색어 조회
  async getPopularKeywords(params: { fromDate?: string; toDate?: string; limit?: number } = {}): Promise<PopularKeywordsApiResponse> {
    const queryString = buildQueryString(params)
    return apiFetch<PopularKeywordsApiResponse>(`/api/v1/keywords/popular${queryString}`)
  },

  // 급등 검색어 조회
  async getTrendingKeywords(params: { currentFromDate?: string; currentToDate?: string; limit?: number } = {}): Promise<TrendingKeywordsApiResponse> {
    const queryString = buildQueryString(params)
    return apiFetch<TrendingKeywordsApiResponse>(`/api/v1/keywords/trending${queryString}`)
  },

  // 실시간 인기 검색어 조회
  async getRealtimeKeywords(params: { limit?: number } = {}): Promise<RealtimeKeywordsResponse> {
    const queryString = buildQueryString(params)
    return apiFetch<RealtimeKeywordsResponse>(`/api/v1/keywords/realtime${queryString}`)
  }
} 