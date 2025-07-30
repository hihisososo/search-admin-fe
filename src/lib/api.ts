// 🔄 리팩토링된 서비스로 이전
// 새로운 API 서비스들을 사용하되, 하위 호환성을 위해 기존 API도 유지
export * from '@/services'

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
      let errorDetails = null
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
        errorDetails = errorData
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
        errorMessage = `HTTP ${response.status}: ${response.statusText}`
      }
      
      // 개발 환경에서 더 자세한 에러 정보 출력
      if (config.isDevelopment()) {
        console.error('API 에러 상세:', {
          url: fullUrl,
          status: response.status,
          statusText: response.statusText,
          errorMessage,
          errorDetails,
          requestOptions
        })
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

// API 서버 헬스체크
export async function healthCheck(): Promise<{ status: 'ok' | 'error', message: string }> {
  try {
    const _response = await apiFetch<unknown>('/api/v1/health')
    return { status: 'ok', message: '서버 정상' }
  } catch (error) {
    console.error('헬스체크 실패:', error)
    return { 
      status: 'error', 
      message: error instanceof Error ? error.message : '서버 연결 실패' 
    }
  }
}

// 개발 환경용 API 상태 확인
export async function checkApiStatus() {
  if (config.isDevelopment()) {
    console.log('API 상태 확인 중...')
    const health = await healthCheck()
    console.log('API 상태:', health)
    return health
  }
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

// 배포 관리 API 함수들
export const deploymentApi = {
  // 환경 정보 조회
  async getEnvironments(): Promise<import('@/types/deploy').EnvironmentsResponse> {
    return apiFetch<import('@/types/deploy').EnvironmentsResponse>('/api/v1/deployment/environments')
  },

  // 색인 실행 (개발환경만)
  async executeIndexing(request: import('@/types/deploy').IndexingRequest = {}): Promise<import('@/types/deploy').OperationResponse> {
    return apiFetch<import('@/types/deploy').OperationResponse>('/api/v1/deployment/indexing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })
  },

  // 배포 실행
  async executeDeploy(request: import('@/types/deploy').DeploymentRequest = {}): Promise<import('@/types/deploy').OperationResponse> {
    return apiFetch<import('@/types/deploy').OperationResponse>('/api/v1/deployment/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })
  },

  // 배포 이력 조회
  async getDeploymentHistory(params: import('@/types/deploy').DeploymentHistoryParams = {}): Promise<import('@/types/deploy').DeploymentHistoryResponse> {
    const queryString = buildQueryString(params)
    return apiFetch<import('@/types/deploy').DeploymentHistoryResponse>(`/api/v1/deployment/history${queryString}`)
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
export const synonymDictionaryApi = {
  // 목록 조회
  async getList(params: {
    page?: number
    size?: number
    search?: string
    sortBy?: string
    sortDir?: string
    environment?: string
  } = {}): Promise<DictionaryPageResponse<SynonymDictionaryItem>> {
    const queryString = buildQueryString(params)
    return apiFetch<DictionaryPageResponse<SynonymDictionaryItem>>(`/api/v1/dictionaries/synonym${queryString}`)
  },

  // 생성
  async create(data: { keyword: string; description?: string }): Promise<SynonymDictionaryItem> {
    return apiFetch<SynonymDictionaryItem>('/api/v1/dictionaries/synonym', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 상세 조회
  async getById(id: number): Promise<SynonymDictionaryItem> {
    return apiFetch<SynonymDictionaryItem>(`/api/v1/dictionaries/synonym/${id}`)
  },

  // 수정
  async update(id: number, data: { keyword: string; description?: string }): Promise<SynonymDictionaryItem> {
    return apiFetch<SynonymDictionaryItem>(`/api/v1/dictionaries/synonym/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  // 삭제
  async delete(id: number): Promise<void> {
    return apiFetch<void>(`/api/v1/dictionaries/synonym/${id}`, {
      method: 'DELETE'
    })
  }
}

// 🆕 오타교정 사전 API 함수들
export const typoCorrectionDictionaryApi = {
  // 목록 조회
  async getList(params: {
    page?: number
    size?: number
    search?: string
    sortBy?: string
    sortDir?: string
    environment?: string
  } = {}): Promise<DictionaryPageResponse<TypoCorrectionDictionaryItem>> {
    const queryString = buildQueryString(params)
    return apiFetch<DictionaryPageResponse<TypoCorrectionDictionaryItem>>(`/api/v1/dictionaries/typo${queryString}`)
  },

  // 생성
  async create(data: { keyword: string; correctedWord: string; description?: string }): Promise<TypoCorrectionDictionaryItem> {
    return apiFetch<TypoCorrectionDictionaryItem>('/api/v1/dictionaries/typo', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 상세 조회
  async getById(id: number): Promise<TypoCorrectionDictionaryItem> {
    return apiFetch<TypoCorrectionDictionaryItem>(`/api/v1/dictionaries/typo/${id}`)
  },

  // 수정
  async update(id: number, data: { keyword: string; correctedWord: string; description?: string }): Promise<TypoCorrectionDictionaryItem> {
    return apiFetch<TypoCorrectionDictionaryItem>(`/api/v1/dictionaries/typo/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  // 삭제
  async delete(id: number): Promise<void> {
    return apiFetch<void>(`/api/v1/dictionaries/typo/${id}`, {
      method: 'DELETE'
    })
  },

  // 🆕 실시간 동기화
  async realtimeSync(environment: string): Promise<RealtimeSyncResponse> {
    const params = new URLSearchParams({ environment })
    return apiFetch<RealtimeSyncResponse>(`/api/v1/dictionaries/typo/realtime-sync?${params}`, {
      method: 'POST'
    })
  },

  // 🆕 동기화 상태 조회
  async getSyncStatus(): Promise<SyncStatusResponse> {
    return apiFetch<SyncStatusResponse>('/api/v1/dictionaries/typo/sync-status')
  }
}

// 🆕 불용어 사전 API 함수들
export const stopwordDictionaryApi = {
  // 목록 조회
  async getList(params: {
    page?: number
    size?: number
    search?: string
    sortBy?: string
    sortDir?: string
    environment?: string
  } = {}): Promise<DictionaryPageResponse<StopwordDictionaryItem>> {
    const queryString = buildQueryString(params)
    return apiFetch<DictionaryPageResponse<StopwordDictionaryItem>>(`/api/v1/dictionaries/stopword${queryString}`)
  },

  // 생성
  async create(data: { keyword: string; description?: string }): Promise<StopwordDictionaryItem> {
    return apiFetch<StopwordDictionaryItem>('/api/v1/dictionaries/stopword', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 상세 조회
  async getById(id: number): Promise<StopwordDictionaryItem> {
    return apiFetch<StopwordDictionaryItem>(`/api/v1/dictionaries/stopword/${id}`)
  },

  // 수정
  async update(id: number, data: { keyword: string; description?: string }): Promise<StopwordDictionaryItem> {
    return apiFetch<StopwordDictionaryItem>(`/api/v1/dictionaries/stopword/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  // 삭제
  async delete(id: number): Promise<void> {
    return apiFetch<void>(`/api/v1/dictionaries/stopword/${id}`, {
      method: 'DELETE'
    })
  }
}

// 🆕 사용자 사전 API 함수들
export const userDictionaryApi = {
  // 목록 조회
  async getList(params: {
    page?: number
    size?: number
    search?: string
    sortBy?: string
    sortDir?: string
    environment?: string
  } = {}): Promise<DictionaryPageResponse<UserDictionaryItem>> {
    const queryString = buildQueryString(params)
    return apiFetch<DictionaryPageResponse<UserDictionaryItem>>(`/api/v1/dictionaries/user${queryString}`)
  },

  // 생성
  async create(data: { keyword: string; description?: string }): Promise<UserDictionaryItem> {
    return apiFetch<UserDictionaryItem>('/api/v1/dictionaries/user', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 상세 조회
  async getById(id: number): Promise<UserDictionaryItem> {
    return apiFetch<UserDictionaryItem>(`/api/v1/dictionaries/user/${id}`)
  },

  // 수정
  async update(id: number, data: { keyword: string; description?: string }): Promise<UserDictionaryItem> {
    return apiFetch<UserDictionaryItem>(`/api/v1/dictionaries/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  // 삭제
  async delete(id: number): Promise<void> {
    return apiFetch<void>(`/api/v1/dictionaries/user/${id}`, {
      method: 'DELETE'
    })
  }
}

// 🆕 실시간 반영 API 함수들
export const realtimeSyncApi = {
  // 동의어 사전 실시간 반영
  async syncSynonym(environment: string): Promise<RealtimeSyncResponse> {
    const params = new URLSearchParams({ environment })
    return apiFetch<RealtimeSyncResponse>(`/api/v1/dictionaries/realtime-sync/synonym?${params}`, {
      method: 'POST'
    })
  },

  // 오타교정 사전 실시간 반영
  async syncTypoCorrection(environment: string): Promise<RealtimeSyncResponse> {
    return typoCorrectionDictionaryApi.realtimeSync(environment)
  },

  // 모든 사전 실시간 반영
  async syncAll(environment: string): Promise<RealtimeSyncResponse> {
    const params = new URLSearchParams({ environment })
    return apiFetch<RealtimeSyncResponse>(`/api/v1/dictionaries/realtime-sync/all?${params}`, {
      method: 'POST'
    })
  },

  // 동기화 상태 조회
  async getStatus(): Promise<SyncStatusResponse> {
    return apiFetch<SyncStatusResponse>('/api/v1/dictionaries/realtime-sync/status')
  }
}

// 🆕 검색 API 업데이트 (오타교정 옵션 추가)
export const enhancedSearchApi = {
  // 상품 검색 실행 (오타교정 옵션 포함)
  async executeSearch(params: {
    query: string
    page: number
    size: number
    applyTypoCorrection?: boolean
    sortField?: string
    sortOrder?: string
    brand?: string[]
    category?: string[]
    priceFrom?: number
    priceTo?: number
  }): Promise<SearchResponse> {
    const queryString = buildQueryString(params)
    return apiFetch<SearchResponse>(`/api/v1/search${queryString}`)
  },

  // 검색 시뮬레이션 (오타교정 옵션 포함)
  async simulateSearch(params: {
    query: string
    page: number
    size: number
    environmentType: string
    explain?: boolean
    applyTypoCorrection?: boolean
    sortField?: string
    sortOrder?: string
    brand?: string[]
    category?: string[]
    priceFrom?: number
    priceTo?: number
  }): Promise<SearchResponse> {
    const queryString = buildQueryString(params)
    return apiFetch<SearchResponse>(`/api/v1/search/simulation${queryString}`)
  },

  // 🆕 자동완성 시뮬레이션
  async simulateAutocomplete(params: {
    keyword: string
    environmentType: string
  }): Promise<AutocompleteResponse> {
    const queryString = buildQueryString(params)
    return apiFetch<AutocompleteResponse>(`/api/v1/search/autocomplete/simulation${queryString}`)
  }
} 

// 🆕 검색 로그 API 함수들
export const searchLogApi = {
  // 검색 로그 목록 조회
  async getList(params: import('@/types/dashboard').SearchLogParams = {}): Promise<import('@/types/dashboard').SearchLogPageResponse> {
    const queryString = buildQueryString(params)
    return apiFetch<import('@/types/dashboard').SearchLogPageResponse>(`/api/v1/search-logs${queryString}`)
  },

  // 필터 옵션 조회
  async getFilterOptions(): Promise<import('@/types/dashboard').SearchLogFilterOptions> {
    return apiFetch<import('@/types/dashboard').SearchLogFilterOptions>('/api/v1/search-logs/filter-options')
  }
} 