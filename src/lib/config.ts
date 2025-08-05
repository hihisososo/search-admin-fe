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
    this.config = {
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
      environment: import.meta.env.MODE === 'production' ? 'production' : 'development',
      enableDebugMode: import.meta.env.MODE === 'development'
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