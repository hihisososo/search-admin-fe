// 앱 설정 인터페이스
export interface AppConfig {
  apiBaseUrl: string
  environment: 'development' | 'production'
  enableDebugMode: boolean
}

// 설정 관리 클래스
class ConfigManager {
  private config: AppConfig

  constructor() {
    const isProd = import.meta.env.MODE === 'production'
    const defaultBaseUrl = isProd ? '/api' : 'http://localhost:8080/api'

    this.config = {
      // 운영: Nginx 프록시('/api') 사용, 개발: 백엔드(8080) 직접 호출
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || defaultBaseUrl,
      environment: isProd ? 'production' : 'development',
      enableDebugMode: !isProd
    }

    // 개발 환경에서만 설정 출력
    if (this.config.environment === 'development') {
      // App configuration loaded
    }
  }

  // 설정값 가져오기
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key]
  }

  // 개발 환경 확인
  isDevelopment(): boolean {
    return this.config.environment === 'development'
  }

  // 프로덕션 환경 확인
  isProduction(): boolean {
    return this.config.environment === 'production'
  }
}

export const config = new ConfigManager() 