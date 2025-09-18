import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { useDashboardData } from '@/hooks/use-dashboard'
import { formatDateToISO } from '@/utils/date-helpers'
import type { DashboardApiParams } from '@/services'
import { useDashboardTransformers } from './hooks/use-dashboard-transformers'
import { DASHBOARD_CONSTANTS } from './constants'
import DashboardHeader from './components/DashboardHeader'
import StatsCards from './components/StatsCards'
import ResponseTimeChart from './components/ResponseTimeChart'
import SearchVolumeChart from './components/SearchVolumeChart'
import KeywordsTable from './components/KeywordsTable'

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>(
    DASHBOARD_CONSTANTS.getDefaultDateRange()
  )

  const apiParams = useMemo((): DashboardApiParams => {
    const params: DashboardApiParams = {}
    if (dateRange.from) params.from = formatDateToISO(dateRange.from, false)
    if (dateRange.to) params.to = formatDateToISO(dateRange.to, true)
    return params
  }, [dateRange])

  const dashboardData = useDashboardData(apiParams)
  const {
    convertStatsToStatItems,
    convertTrendsToChartData,
    convertPopularKeywordsToTableData,
    convertTrendingKeywordsToTableData
  } = useDashboardTransformers()

  const stats = dashboardData.stats.data
    ? convertStatsToStatItems(dashboardData.stats.data)
    : []

  const { responseTimeData, searchVolumeData } = dashboardData.trends.data
    ? convertTrendsToChartData(dashboardData.trends.data)
    : { responseTimeData: [], searchVolumeData: [] }

  const popularKeywords = convertPopularKeywordsToTableData(
    dashboardData.popularKeywords.data?.keywords || []
  )

  const trendingKeywords = convertTrendingKeywordsToTableData(
    dashboardData.trendingKeywords.data?.keywords || []
  )

  return (
    <div className="p-4 space-y-3">
        <DashboardHeader
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        <StatsCards stats={stats} loading={dashboardData.isLoading} />

        <div className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <SearchVolumeChart
              data={searchVolumeData}
              loading={dashboardData.isLoading}
            />
            <ResponseTimeChart
              data={responseTimeData}
              loading={dashboardData.isLoading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <KeywordsTable
              keywords={popularKeywords}
              loading={dashboardData.isLoading}
              title="인기 검색어 TOP 10"
              type="popular"
            />
            <KeywordsTable
              keywords={trendingKeywords}
              loading={dashboardData.isLoading}
              title="급등 검색어 TOP 10"
              type="trending"
            />
          </div>
        </div>
    </div>
  )
}