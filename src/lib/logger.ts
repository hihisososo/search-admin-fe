export interface LogLevel {
  INFO: 'INFO'
  WARN: 'WARN'
  ERROR: 'ERROR'
  DEBUG: 'DEBUG'
}

export interface LogMeta {
  [key: string]: unknown
}

export interface LogEntry {
  level: keyof LogLevel
  message: string
  timestamp: string
  url?: string
  meta?: LogMeta
  error?: Error
}

class Logger {
  private isDevelopment = import.meta.env.MODE === 'development'

  info(message: string, data?: LogMeta): void {
    console.log(`[INFO] ${message}`, data)
  }

  warn(message: string, data?: LogMeta): void {
    console.warn(`[WARN] ${message}`, data)
  }

  error(message: string, error?: Error, data?: LogMeta): void {
    console.error(`[ERROR] ${message}`, error, data)
  }

  debug(message: string, data?: LogMeta): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data)
    }
  }
}

export const logger = new Logger()