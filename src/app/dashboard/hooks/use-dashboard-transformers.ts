import { useCallback } from 'react'
import type {
  DashboardStats,
  TrendsResponse,
  IndexDistributionResponse,
  KeywordItem,
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
  const convertStatsToStatItems = useCallback((dashboardStats: DashboardStats): StatItem[] => [
    { label: '검색량', value: dashboardStats.totalSearchCount.toLocaleString() },
    { label: '문서량', value: dashboardStats.totalDocumentCount.toLocaleString() },
    { label: '검색실패', value: `${dashboardStats.searchFailureRate}%` },
    { label: '에러건수', value: dashboardStats.errorCount },
    { label: '평균응답시간', value: `${Math.round(dashboardStats.averageResponseTimeMs)}ms` },
    { label: '성공률', value: `${dashboardStats.successRate}%` },
  ], [])

  const convertTrendsToChartData = useCallback((trendsData: TrendsResponse) => {
    const responseTimeData = trendsData.responseTimeData.map((item) => ({
      date: item.label,
      responseTime: item.averageResponseTime,
    }))

    const searchVolumeData = trendsData.searchVolumeData.map((item) => ({
      date: item.label,
      searches: item.searchCount,
      successfulSearches: Math.round(item.searchCount * DASHBOARD_CONSTANTS.DEFAULT_SUCCESS_RATE),
      failedSearches: Math.round(item.searchCount * DASHBOARD_CONSTANTS.DEFAULT_FAILURE_RATE),
    }))

    return { responseTimeData, searchVolumeData }
  }, [])

  const convertIndexDistributionToChartData = useCallback(
    (distributionData: IndexDistributionResponse) =>
      distributionData.indices.map((item, index) => ({
        name: item.indexName,
        value: item.percentage,
        color: DASHBOARD_CONSTANTS.COLORS[index % DASHBOARD_CONSTANTS.COLORS.length],
      })),
    []
  )

  const convertKeywordsToTableData = useCallback(
    (keywords: KeywordItem[]): TopKeyword[] =>
      keywords.map((item) => ({
        keyword: item.keyword,
        searches: item.searchCount,
        ctr: `${item.percentage || 0}%`,
        trend: 'stable' as const,
      })),
    []
  )

  const mergeKeywords = useCallback(
    (popularKeywords: KeywordItem[], trendingKeywords: KeywordItem[]): TopKeyword[] => {
      const popular = convertKeywordsToTableData(popularKeywords)
      const trending = convertKeywordsToTableData(trendingKeywords).map((item) => ({
        ...item,
        trend: 'up' as const,
      }))

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
    [convertKeywordsToTableData]
  )

  return {
    convertStatsToStatItems,
    convertTrendsToChartData,
    convertIndexDistributionToChartData,
    convertKeywordsToTableData,
    mergeKeywords,
  }
}