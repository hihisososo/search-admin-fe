import { useCallback } from 'react'
import type {
  DashboardStats,
  TrendsResponse,
  PopularKeywordItem,
  TrendingKeywordItem,
  StatItem,
} from '@/services'
import { DASHBOARD_CONSTANTS } from '../constants'

export interface TopKeyword {
  keyword: string
  searches: number
  ctr: string
  trend: 'up' | 'down' | 'stable'
}

export function useDashboardTransformers() {
  const convertStatsToStatItems = useCallback((dashboardStats: DashboardStats | null | undefined): StatItem[] => {
    if (!dashboardStats) {
      return [
        { label: '총 검색수', value: '0' },
        { label: '평균 응답시간', value: '0ms' },
        { label: '에러율', value: '0%' },
        { label: '고유 사용자', value: '0' },
      ]
    }
    
    return [
      { label: '총 검색수', value: (dashboardStats.totalSearches || 0).toLocaleString() },
      { label: '평균 응답시간', value: `${Math.round(dashboardStats.averageResponseTime || 0)}ms` },
      { label: '에러율', value: `${((dashboardStats.errorRate || 0) * 100).toFixed(1)}%` },
      { label: '고유 사용자', value: (dashboardStats.uniqueUsers || 0).toLocaleString() },
    ]
  }, [])

  const convertTrendsToChartData = useCallback((trendsData: TrendsResponse | null | undefined) => {
    if (!trendsData || !trendsData.trends) {
      return { responseTimeData: [], searchVolumeData: [] }
    }

    // 응답시간 데이터: API에서 직접 제공하지 않으므로 빈 배열 반환
    const responseTimeData = trendsData.trends.map((item) => ({
      date: item.timestamp,
      responseTime: 0, // API에서 제공하지 않음
    }))

    // 검색량 데이터
    const searchVolumeData = trendsData.trends.map((item) => ({
      date: item.timestamp,
      searches: item.searchCount,
      successfulSearches: item.searchCount - item.errorCount,
      failedSearches: item.errorCount,
    }))

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
        ctr: '0%', // API에서 CTR 제공하지 않음
        trend: 'stable' as const,
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
        ctr: `${item.growthRate.toFixed(1)}%`,
        trend: item.growthRate > 0 ? 'up' : item.growthRate < 0 ? 'down' : 'stable',
      }))
    },
    []
  )

  const mergeKeywords = useCallback(
    (popularKeywords: PopularKeywordItem[] | null | undefined, trendingKeywords: TrendingKeywordItem[] | null | undefined): TopKeyword[] => {
      const popular = convertPopularKeywordsToTableData(popularKeywords || [])
      const trending = convertTrendingKeywordsToTableData(trendingKeywords || [])

      const keywordMap = new Map<string, TopKeyword>()
      
      popular.forEach((item) => keywordMap.set(item.keyword, item))
      trending.forEach((item) => {
        if (!keywordMap.has(item.keyword)) {
          keywordMap.set(item.keyword, item)
        }
      })

      return Array.from(keywordMap.values())
        .slice(0, DASHBOARD_CONSTANTS.MAX_KEYWORDS_DISPLAY)
    },
    [convertPopularKeywordsToTableData, convertTrendingKeywordsToTableData]
  )

  return {
    convertStatsToStatItems,
    convertTrendsToChartData,
    convertKeywordsToTableData: convertPopularKeywordsToTableData,
    mergeKeywords,
  }
}