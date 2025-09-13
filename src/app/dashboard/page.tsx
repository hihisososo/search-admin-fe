import { useMemo, useCallback, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { useDashboardData } from '@/hooks/use-dashboard'
import { useDashboardTransformers } from './hooks/use-dashboard-transformers'
import { DASHBOARD_CONSTANTS } from './constants'
import DashboardHeader from './components/DashboardHeader'
import StatsCards from './components/StatsCards'
import AnalyticsCharts from './components/AnalyticsCharts'
import KeywordsTable from './components/KeywordsTable'

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: DASHBOARD_CONSTANTS.getDefaultDateRange().from,
    to: DASHBOARD_CONSTANTS.getDefaultDateRange().to,
  })

  const apiParams = useMemo(() => {
    const params: any = {}
    
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from)
      const year = fromDate.getFullYear()
      const month = String(fromDate.getMonth() + 1).padStart(2, '0')
      const day = String(fromDate.getDate()).padStart(2, '0')
      params.from = `${year}-${month}-${day}T00:00:00`
    }
    
    if (dateRange.to) {
      const toDate = new Date(dateRange.to)
      // 선택된 날짜의 마지막 시간으로 설정 (23:59:59)
      const year = toDate.getFullYear()
      const month = String(toDate.getMonth() + 1).padStart(2, '0')
      const day = String(toDate.getDate()).padStart(2, '0')
      params.to = `${year}-${month}-${day}T23:59:59`
    }
    
    return params
  }, [dateRange])

  const dashboardData = useDashboardData(apiParams)
  const transformers = useDashboardTransformers()

  const stats = useMemo(() => 
    dashboardData.stats.data 
      ? transformers.convertStatsToStatItems(dashboardData.stats.data) 
      : []
  , [dashboardData.stats.data, transformers])

  const { responseTimeData, searchVolumeData } = useMemo(() => 
    dashboardData.trends.data 
      ? transformers.convertTrendsToChartData(dashboardData.trends.data) 
      : { responseTimeData: [], searchVolumeData: [] }
  , [dashboardData.trends.data, transformers])


  const popularKeywords = useMemo(() => {
    const keywords = dashboardData.popularKeywords.data?.keywords || []
    return transformers.convertPopularKeywordsToTableData(keywords)
  }, [dashboardData.popularKeywords.data, transformers])

  const trendingKeywords = useMemo(() => {
    const keywords = dashboardData.trendingKeywords.data?.keywords || []
    return transformers.convertTrendingKeywordsToTableData(keywords)
  }, [dashboardData.trendingKeywords.data, transformers])

  const handleRefresh = useCallback(() => {
    Object.values(dashboardData).forEach(query => {
      if (query && typeof query === 'object' && 'refetch' in query) {
        query.refetch()
      }
    })
  }, [dashboardData])

  const isLoading = Object.values(dashboardData).some(query => {
    return query && typeof query === 'object' && 'isLoading' in query && query.isLoading
  })

  return (
    <div className="p-4 space-y-3">
        <DashboardHeader
          dateRange={dateRange}
          setDateRange={setDateRange}
          onRefresh={handleRefresh}
          loading={isLoading}
          lastUpdated={new Date()}
        />
        
        <StatsCards stats={stats} loading={isLoading} />
        
        <div className="space-y-3">
          <AnalyticsCharts
            responseTimeData={responseTimeData}
            searchVolumeData={searchVolumeData}
            loading={isLoading}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <KeywordsTable 
              keywords={popularKeywords} 
              loading={isLoading}
              title="인기 검색어 TOP 10"
              type="popular"
            />
            <KeywordsTable 
              keywords={trendingKeywords} 
              loading={isLoading}
              title="급등 검색어 TOP 10"
              type="trending"
            />
          </div>
        </div>
    </div>
  )
}