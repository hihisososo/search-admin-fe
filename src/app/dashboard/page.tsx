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
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <DashboardHeader
          dateRange={dateRange}
          setDateRange={setDateRange}
          onRefresh={handleRefresh}
          loading={isLoading}
          lastUpdated={new Date()}
        />
        
        <StatsCards stats={stats} loading={isLoading} />
        
        <Tabs defaultValue="analytics" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:w-fit lg:grid-cols-2 bg-white/50 backdrop-blur-sm p-1 rounded-xl shadow-sm">
            <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200">
              <BarChart3 className="h-4 w-4" />
              <span className="font-medium">분석</span>
            </TabsTrigger>
            <TabsTrigger value="keywords" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200">
              <Search className="h-4 w-4" />
              <span className="font-medium">키워드</span>
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