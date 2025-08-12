// 서비스 게이트웨이: 서비스 레이어만 재-export (슬림화)
export * from '@/services'

// 하위 호환 및 타입 제공만 유지
import { config } from './config'
import { apiFetch } from '@/services/common/api-client'
// 대시보드 타입은 현재 파일에서 직접 사용하지 않음

// 검색 관련 타입 정의
export interface Product {
  id: string
  score?: number
  name: string
  nameRaw: string
  model?: string[]
  brand: string
  categoryName: string
  price: number
  registeredMonth?: string
  rating: number
  reviewCount: number
  thumbnailUrl: string
  specs?: string
  specsRaw?: string
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
    brand_name?: AggregationBucket[]
    category_name?: AggregationBucket[]
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
  previousRank: number
  rankChange: number
  changeStatus: "UP" | "DOWN" | "NEW" | "SAME"
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

// apiFetch, apiFetchJson, apiFetchMultipart 는 services 레이어 구현을 사용합니다.
// 헬스체크/상태 확인 등 레거시는 차후 services 측으로 이관 예정
export async function healthCheck(): Promise<{ status: 'ok' | 'error', message: string }> { return { status: 'ok', message: 'deprecated' } }
export async function checkApiStatus() { return { status: 'ok', message: 'deprecated' } as any }

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
// 대시보드 API는 services 레이어의 dashboardApi 를 사용하십시오.

// 검색 API 함수들
export const searchApi = {
  // 자동완성
  async getAutocomplete(keyword: string): Promise<AutocompleteResponse> {
    const queryString = buildQueryString({ keyword })
    return apiFetch<AutocompleteResponse>(`/v1/search/autocomplete${queryString}`)
  },

  // 상품 검색 - GET 방식
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
    return apiFetch<SearchResponse>(`/v1/search?${queryString}`)
  },


  // 실시간 인기 검색어 조회
  async getRealtimeKeywords(params: { limit?: number } = {}): Promise<RealtimeKeywordsResponse> {
    const queryString = buildQueryString(params)
    return apiFetch<RealtimeKeywordsResponse>(`/v1/keywords/realtime${queryString}`)
  }
} 

 

// 🆕 사전 관련 타입 정의
export interface DictionaryEnvironmentType {
  CURRENT: "CURRENT"
  DEV: "DEV" 
  PROD: "PROD"
}

export interface SynonymDictionaryItem {
  id: number
  keyword: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface TypoCorrectionDictionaryItem {
  id: number
  keyword: string
  correctedWord: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface StopwordDictionaryItem {
  id: number
  keyword: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface UserDictionaryItem {
  id: number
  keyword: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface DictionaryPageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface RealtimeSyncResponse {
  success: boolean
  message: string
  environment: string
  timestamp: number
}

export interface SyncStatusResponse {
  success: boolean
  typoCorrectionStatus: string
  lastSyncTime: number
  timestamp: number
}

// 🆕 동의어 사전 API 함수들
// 사전/대시보드 API는 services 레이어의 *DictionaryService, dashboardApi 를 사용하십시오.

// 실시간 반영 API는 각 사전 서비스에서 제공되므로 삭제

// 🆕 검색 API 업데이트 (오타교정 옵션 추가)
export const enhancedSearchApi = {
  // 상품 검색 실행 (오타교정 옵션 포함)
  async executeSearch(params: {
    query: string
    page: number
    size: number
    // applyTypoCorrection?: boolean - 백엔드에서 미지원
    sortField?: string
    sortOrder?: string
    brand?: string[]
    category?: string[]
    priceFrom?: number
    priceTo?: number
  }): Promise<SearchResponse> {
    const queryString = buildQueryString(params)
    return apiFetch<SearchResponse>(`/v1/search${queryString}`)
  },

  // 검색 시뮬레이션 (오타교정 옵션 포함)
  async simulateSearch(params: {
    query: string
    page: number
    size: number
    environmentType: string
    explain?: boolean
    // applyTypoCorrection?: boolean - 백엔드에서 미지원
    sortField?: string
    sortOrder?: string
    brand?: string[]
    category?: string[]
    priceFrom?: number
    priceTo?: number
  }): Promise<SearchResponse> {
    const queryString = buildQueryString(params)
    return apiFetch<SearchResponse>(`/v1/search/simulation${queryString}`)
  },

  // 🆕 자동완성 시뮬레이션
  async simulateAutocomplete(params: {
    keyword: string
    environmentType: string
  }): Promise<AutocompleteResponse> {
    const queryString = buildQueryString(params)
    return apiFetch<AutocompleteResponse>(`/v1/search/autocomplete/simulation${queryString}`)
  }
} 

// 🆕 검색 로그 API 함수들
 