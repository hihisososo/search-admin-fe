import { logger } from '@/lib/logger'
import { APIError, errorTracker } from '@/lib/errorHandler'
import { config } from '@/lib/config'

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || config.get('apiBaseUrl')
  }

  public async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    logger.debug('API 요청', { endpoint, method: options.method || 'GET' })

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`
    
    // 평가 API 호출 시 상세 로그
    if (endpoint.includes('/evaluation/')) {
      console.log(`🌐 API 호출: ${options.method || 'GET'} ${url}`)
      if (options.body) {
        console.log(`📝 요청 Body:`, options.body)
      }
    }
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        // FormData인 경우 Content-Type을 설정하지 않음
        ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
        ...(options.headers || {}),
      },
    }

    try {
      const response = await fetch(url, requestOptions)
      
      if (!response.ok) {
        let errorMessage = 'API 오류'
        let errorDetails = null
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
          errorDetails = errorData
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        
        if (config.isDevelopment()) {
          console.error('API 에러 상세:', {
            url,
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

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        logger.debug('API 성공', { url })
        
        // 평가 API 응답 시 상세 로그
        if (endpoint.includes('/evaluation/')) {
          console.log(`✅ API 응답: ${options.method || 'GET'} ${url}`)
          console.log(`📄 응답 데이터:`, data)
        }
        
        return data
      } else {
        const data = await response.text()
        logger.debug('API 성공 (텍스트)', { url })
        return data as T
      }

    } catch (error) {
      if (!(error instanceof APIError)) {
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

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | string[] | undefined>): Promise<T> {
    const queryString = params ? this.buildQueryString(params) : ''
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request<T>(url, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data)
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data)
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  private buildQueryString(params: Record<string, string | number | boolean | string[] | undefined>): string {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, String(item)))
        } else {
          searchParams.append(key, String(value))
        }
      }
    })
    
    return searchParams.toString()
  }
}

// 기본 API 클라이언트 인스턴스
export const apiClient = new ApiClient()

// 하위 호환성을 위한 기존 함수들
export const apiFetch = <T>(url: string, options?: RequestInit): Promise<T> => {
  const method = options?.method || 'GET'
  
  if (method === 'GET') {
    return apiClient.get<T>(url)
  } else if (method === 'POST') {
    return apiClient.post<T>(url, options?.body)
  } else if (method === 'PUT') {
    return apiClient.put<T>(url, options?.body)
  } else if (method === 'DELETE') {
    return apiClient.delete<T>(url)
  } else {
    // 기타 메소드는 직접 처리
    return apiClient.request<T>(url, options)
  }
}

export const apiFetchJson = <T>(url: string, data: unknown, method = 'POST'): Promise<T> => {
  return method === 'GET' 
    ? apiClient.get<T>(url, data as Record<string, string | number | boolean | string[] | undefined>)
    : apiClient.post<T>(url, data)
}

export const apiFetchMultipart = <T>(url: string, formData: FormData, _method = 'POST'): Promise<T> => {
  return apiClient.post<T>(url, formData)
} 