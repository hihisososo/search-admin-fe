import { useMemo, useCallback, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, Search } from 'lucide-react'
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
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardHeader
          dateRange={dateRange}
          setDateRange={setDateRange}
          onRefresh={handleRefresh}
          loading={isLoading}
          lastUpdated={new Date()}
        />
        
        <StatsCards stats={stats} loading={isLoading} />
        
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-fit lg:grid-cols-2">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              분석
            </TabsTrigger>
            <TabsTrigger value="keywords" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              키워드
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsCharts
              responseTimeData={responseTimeData}
              searchVolumeData={searchVolumeData}
              loading={isLoading}
            />
          </TabsContent>

          <TabsContent value="keywords" className="space-y-6">
            <KeywordsTable keywords={topKeywords} loading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}