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
  trend: 'up' | 'down' | 'stable' | 'new'
  percentage?: number
  rank?: number
}

export function useDashboardTransformers() {
  const convertStatsToStatItems = useCallback((dashboardStats: DashboardStats | null | undefined): StatItem[] => {
    if (!dashboardStats) {
      return [
        { label: '검색량', value: '0' },
        { label: '검색실패', value: '0%' },
        { label: '에러건수', value: '0' },
        { label: '평균응답시간', value: '0ms' },
        { label: '성공률', value: '0%' },
        { label: '클릭수', value: '0' },
        { label: 'CTR', value: '0%' },
      ]
    }
    
    return [
      { label: '검색량', value: (dashboardStats.totalSearchCount || 0).toLocaleString() },
      { label: '검색실패', value: `${(dashboardStats.searchFailureRate || 0).toFixed(1)}%` },
      { label: '에러건수', value: (dashboardStats.errorCount || 0).toLocaleString() },
      { label: '평균응답시간', value: `${Math.round(dashboardStats.averageResponseTimeMs || 0)}ms` },
      { label: '성공률', value: `${(dashboardStats.successRate || 0).toFixed(1)}%` },
      { label: '클릭수', value: (dashboardStats.clickCount || 0).toLocaleString() },
      { label: 'CTR', value: `${(dashboardStats.clickThroughRate || 0).toFixed(1)}%` },
    ]
  }, [])

  const convertTrendsToChartData = useCallback((trendsData: TrendsResponse | null | undefined) => {
    if (!trendsData || !trendsData.searchVolumeData || !trendsData.responseTimeData) {
      return { responseTimeData: [], searchVolumeData: [] }
    }

    // 응답시간 데이터
    const responseTimeData = trendsData.responseTimeData.map((item: any) => ({
      date: item.timestamp,
      responseTime: item.averageResponseTime,
    }))

    // 검색량 데이터
    const searchVolumeData = trendsData.searchVolumeData.map((item: any) => ({
      date: item.timestamp,
      searches: item.searchCount,
      successfulSearches: Math.round(item.searchCount * (1 - 0.02)), // 성공률 98% 가정
      failedSearches: Math.round(item.searchCount * 0.02), // 실패율 2% 가정
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
    convertPopularKeywordsToTableData,
    convertTrendingKeywordsToTableData,
    mergeKeywords,
  }
}