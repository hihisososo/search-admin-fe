export interface LogLevel {
  INFO: 'INFO'
  WARN: 'WARN'
  ERROR: 'ERROR'
  DEBUG: 'DEBUG'
}

export interface LogEntry {
  level: keyof LogLevel
  message: string
  timestamp: string
  url?: string
  meta?: any
  error?: Error
}

class Logger {
  private isDevelopment = import.meta.env.MODE === 'development'

  info(message: string, data?: any): void {
    console.log(`[INFO] ${message}`, data)
  }

  warn(message: string, data?: any): void {
    console.warn(`[WARN] ${message}`, data)
  }

  error(message: string, error?: Error, data?: any): void {
    console.error(`[ERROR] ${message}`, error, data)
  }

  debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data)
    }
  }
}

export const logger = new Logger() 