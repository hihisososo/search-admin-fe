import { logger } from './logger'

export class AppError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AppError'
  }
}

export class APIError extends AppError {
  public readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'APIError'
    this.status = status
  }
}

class ErrorTracker {
  constructor() {
    window.addEventListener('error', (event) => {
      logger.error('전역 에러 발생', new Error(event.message))
    })

    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Promise 에러 발생', new Error(event.reason))
    })
  }

  captureException(error: Error): void {
    logger.error('에러 발생', error)
  }

  // 사용자 친화적 메시지
  getUserFriendlyMessage(error: Error): string {
    if (error instanceof APIError) {
      switch (error.status) {
        case 400:
          return '입력한 정보를 다시 확인해주세요.'
        case 401:
          return '로그인이 필요합니다.'
        case 403:
          return '접근 권한이 없습니다.'
        case 404:
          return '요청한 리소스를 찾을 수 없습니다.'
        case 500:
          return '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
        default:
          return '네트워크 오류가 발생했습니다.'
      }
    }
    
    return error.message || '예상치 못한 오류가 발생했습니다.'
  }
}

export const errorTracker = new ErrorTracker() 