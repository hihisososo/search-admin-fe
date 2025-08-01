export const DASHBOARD_CONSTANTS = {
  COLORS: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'] as const,
  
  DEFAULT_SUCCESS_RATE: 0.98,
  DEFAULT_FAILURE_RATE: 0.02,
  
  MAX_KEYWORDS_DISPLAY: 10,
  
  DATE_RANGE_DAYS: 6,
  
  getDefaultDateRange: () => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(today.getDate() - DASHBOARD_CONSTANTS.DATE_RANGE_DAYS)
    return { from: start, to: today }
  },
} as const

export type DashboardColor = typeof DASHBOARD_CONSTANTS.COLORS[number]