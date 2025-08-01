import { useMemo, useCallback, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, Search, PieChart } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { useDashboardData } from '@/hooks/use-dashboard'
import { useDashboardTransformers } from './hooks/use-dashboard-transformers'
import { DASHBOARD_CONSTANTS } from './constants'
import DashboardHeader from './components/DashboardHeader'
import StatsCards from './components/StatsCards'
import AnalyticsCharts from './components/AnalyticsCharts'
import KeywordsTable from './components/KeywordsTable'
import DistributionChart from './components/DistributionChart'

export default function DashboardPage() {
  const [selectedIndex, setSelectedIndex] = useState<string>('전체')
  const [dateRange, setDateRange] = useState<DateRange>({
    from: DASHBOARD_CONSTANTS.getDefaultDateRange().from,
    to: DASHBOARD_CONSTANTS.getDefaultDateRange().to,
  })

  const apiParams = useMemo(() => ({
    ...(selectedIndex !== '전체' && { indexName: selectedIndex }),
    ...(dateRange.from && { from: dateRange.from.toISOString().replace('Z', '') }),
    ...(dateRange.to && { to: dateRange.to.toISOString().replace('Z', '') }),
  }), [selectedIndex, dateRange])

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

  const indexDistribution = useMemo(() => 
    dashboardData.indexDistribution.data 
      ? transformers.convertIndexDistributionToChartData(dashboardData.indexDistribution.data) 
      : []
  , [dashboardData.indexDistribution.data, transformers])

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
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onRefresh={handleRefresh}
          loading={isLoading}
          lastUpdated={new Date()}
        />
        
        <StatsCards stats={stats} loading={isLoading} />
        
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-fit lg:grid-cols-3">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              분석
            </TabsTrigger>
            <TabsTrigger value="keywords" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              키워드
            </TabsTrigger>
            <TabsTrigger value="distribution" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              분포
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

          <TabsContent value="distribution" className="space-y-6">
            <DistributionChart data={indexDistribution} loading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}