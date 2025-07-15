import { logger } from './logger'
import { APIError, errorTracker } from './errorHandler'
import { config } from './config'

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