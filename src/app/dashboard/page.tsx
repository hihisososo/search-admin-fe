import { useMemo, useCallback, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

  const apiParams = useMemo(() => ({
    ...(dateRange.from && { from: dateRange.from.toISOString().replace('Z', '') }),
    ...(dateRange.to && { to: dateRange.to.toISOString().replace('Z', '') }),
  }), [dateRange])

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


  const topKeywords = useMemo(() => {
    const popularKeywords = dashboardData.popularKeywords.data?.keywords || []
    const trendingKeywords = dashboardData.trendingKeywords.data?.keywords || []
    
    return transformers.mergeKeywords(popularKeywords, trendingKeywords)
  }, [dashboardData.popularKeywords.data, dashboardData.trendingKeywords.data, transformers])

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
        
        <Tabs defaultValue="analytics" className="space-y-3">
          <TabsList className="grid w-full grid-cols-2 lg:w-fit">
            <TabsTrigger value="analytics" className="text-sm">
              분석
            </TabsTrigger>
            <TabsTrigger value="keywords" className="text-sm">
              키워드
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AnalyticsCharts
              responseTimeData={responseTimeData}
              searchVolumeData={searchVolumeData}
              loading={isLoading}
            />
          </TabsContent>

          <TabsContent value="keywords">
            <KeywordsTable keywords={topKeywords} loading={isLoading} />
          </TabsContent>
        </Tabs>
    </div>
  )
}