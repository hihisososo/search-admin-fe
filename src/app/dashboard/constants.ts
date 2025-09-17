const DATE_RANGE_DAYS = 6

export const DASHBOARD_CONSTANTS = {
  MAX_KEYWORDS_DISPLAY: 10,
  getDefaultDateRange: () => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(today.getDate() - DATE_RANGE_DAYS)
    return { from: start, to: today }
  },
} as const