import { useCallback } from 'react'
import type {
  DashboardStats,
  TrendsResponse,
  PopularKeywordItem,
  TrendingKeywordItem,
  StatItem,
  ResponseTimeChartData,
  SearchVolumeChartData,
} from '@/services'
import type { TopKeyword } from '../components/KeywordsTable'

export function useDashboardTransformers() {
  const convertStatsToStatItems = useCallback((dashboardStats: DashboardStats | null | undefined): StatItem[] => {
    if (!dashboardStats) {
      return [
        { label: '검색량', value: '0' },
        { label: '검색0건', value: '0%' },
        { label: '에러건수', value: '0' },
        { label: '평균응답시간', value: '0ms' },
        { label: '성공률', value: '0%' },
        { label: '클릭수', value: '0' },
        { label: 'CTR', value: '0%' },
      ]
    }
    
    const successRate = dashboardStats.successRate ?? 0
    const successRateDisplay = successRate >= 100 ? '100%' : `${successRate.toFixed(2)}%`

    return [
      { label: '검색량', value: (dashboardStats.totalSearchCount || 0).toLocaleString() },
      { label: '검색0건', value: `${(dashboardStats.zeroHitRate || 0).toFixed(1)}%` },
      { label: '에러건수', value: (dashboardStats.errorCount || 0).toLocaleString() },
      { label: '평균응답시간', value: `${Math.round(dashboardStats.averageResponseTimeMs || 0)}ms` },
      { label: '성공률', value: successRateDisplay },
      { label: '클릭수', value: (dashboardStats.clickCount || 0).toLocaleString() },
      { label: 'CTR', value: `${(dashboardStats.clickThroughRate || 0).toFixed(1)}%` },
    ]
  }, [])

  const convertTrendsToChartData = useCallback((trendsData: TrendsResponse | null | undefined): { responseTimeData: ResponseTimeChartData[]; searchVolumeData: SearchVolumeChartData[] } => {
    if (!trendsData || !trendsData.searchVolumeData || !trendsData.responseTimeData) {
      return { responseTimeData: [], searchVolumeData: [] }
    }

    const responseTimeData: ResponseTimeChartData[] = trendsData.responseTimeData.map((item) => ({
      date: item.timestamp,
      responseTime: item.averageResponseTime,
    }))

    const searchVolumeData: SearchVolumeChartData[] = trendsData.searchVolumeData.map((item) => {
      const total = Number(item.searchCount) || 0
      const errorCount = 0
      const success = total
      return {
        date: item.timestamp,
        searches: total,
        successfulSearches: success,
        failedSearches: errorCount,
      }
    })

    return { responseTimeData, searchVolumeData }
  }, [])

  const convertPopularKeywordsToTableData = useCallback(
    (keywords: PopularKeywordItem[] | null | undefined): TopKeyword[] => {
      if (!keywords || !Array.isArray(keywords)) {
        return []
      }
      
      return keywords.map((item) => ({
        keyword: item.keyword,
        searches: item.count,
        ctr: `${(item.clickThroughRate).toFixed(1)}%`,
        trend: item.changeStatus === 'UP' ? 'up' : item.changeStatus === 'DOWN' ? 'down' : item.changeStatus === 'NEW' ? 'new' : 'stable',
        percentage: item.percentage,
        rank: item.rank,
      }))
    },
    []
  )

  const convertTrendingKeywordsToTableData = useCallback(
    (keywords: TrendingKeywordItem[] | null | undefined): TopKeyword[] => {
      if (!keywords || !Array.isArray(keywords)) {
        return []
      }
      
      return keywords.map((item) => ({
        keyword: item.keyword,
        searches: item.count,
        ctr: `${(item.clickThroughRate).toFixed(1)}%`,
        trend: item.changeStatus === 'UP' ? 'up' : item.changeStatus === 'DOWN' ? 'down' : item.changeStatus === 'NEW' ? 'new' : 'stable',
        percentage: item.percentage,
        rank: item.rank,
      }))
    },
    []
  )

  return {
    convertStatsToStatItems,
    convertTrendsToChartData,
    convertPopularKeywordsToTableData,
    convertTrendingKeywordsToTableData,
  }
}