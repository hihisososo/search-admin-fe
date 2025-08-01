import { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, BarChart3 } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from 'recharts'

interface ResponseTimeData {
  date: string
  responseTime: number
}

interface SearchVolumeData {
  date: string
  searches: number
  successfulSearches: number
  failedSearches: number
}

interface AnalyticsChartsProps {
  responseTimeData: ResponseTimeData[]
  searchVolumeData: SearchVolumeData[]
  loading: boolean
}

const CHART_CONFIG = {
  responseTime: {
    label: '응답시간',
    color: '#6366f1',
  },
  successfulSearches: {
    label: '성공한 검색',
    color: '#10b981',
  },
  failedSearches: {
    label: '실패한 검색',
    color: '#ef4444',
  },
} as const

const ChartSkeleton = memo(() => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-4/5" />
    <Skeleton className="h-4 w-3/5" />
  </div>
))

ChartSkeleton.displayName = 'ChartSkeleton'

const NoDataMessage = memo(() => (
  <div className="flex items-center justify-center h-full">
    <span className="text-gray-400 text-sm">데이터가 없습니다</span>
  </div>
))

NoDataMessage.displayName = 'NoDataMessage'

const formatDateTick = (value: string) => value.slice(3)

const ResponseTimeChart = memo(({ data }: { data: ResponseTimeData[] }) => (
  <ChartContainer config={{ responseTime: CHART_CONFIG.responseTime }} className="h-full w-full">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-sm"
          tickFormatter={formatDateTick}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-sm"
          domain={['auto', 'auto']}
        />
        <Tooltip />
        <Line
          dataKey="responseTime"
          type="monotone"
          stroke={CHART_CONFIG.responseTime.color}
          strokeWidth={3}
          dot={{
            fill: CHART_CONFIG.responseTime.color,
            strokeWidth: 3,
            stroke: '#ffffff',
            r: 6,
          }}
          activeDot={{
            r: 8,
            fill: CHART_CONFIG.responseTime.color,
            stroke: '#ffffff',
            strokeWidth: 3,
            className: 'drop-shadow-lg',
          }}
          className="drop-shadow-sm"
        />
      </LineChart>
    </ResponsiveContainer>
  </ChartContainer>
))

ResponseTimeChart.displayName = 'ResponseTimeChart'

const SearchVolumeChart = memo(({ data }: { data: SearchVolumeData[] }) => (
  <ChartContainer
    config={{
      successfulSearches: CHART_CONFIG.successfulSearches,
      failedSearches: CHART_CONFIG.failedSearches,
    }}
    className="h-full w-full"
  >
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-sm"
          tickFormatter={formatDateTick}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-sm" />
        <Tooltip />
        <Area
          dataKey="successfulSearches"
          stackId="1"
          stroke={CHART_CONFIG.successfulSearches.color}
          fill={CHART_CONFIG.successfulSearches.color}
          fillOpacity={0.6}
        />
        <Area
          dataKey="failedSearches"
          stackId="1"
          stroke={CHART_CONFIG.failedSearches.color}
          fill={CHART_CONFIG.failedSearches.color}
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  </ChartContainer>
))

SearchVolumeChart.displayName = 'SearchVolumeChart'

export default memo(function AnalyticsCharts({
  responseTimeData,
  searchVolumeData,
  loading,
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-indigo-500" />
            <CardTitle className="text-xl font-semibold text-gray-900">
              검색 응답시간 추이
            </CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            최근 7일간 평균 응답시간 변화 (단위: ms)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-80 w-full">
            {loading ? (
              <ChartSkeleton />
            ) : responseTimeData.length === 0 ? (
              <NoDataMessage />
            ) : (
              <ResponseTimeChart data={responseTimeData} />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-xl font-semibold text-gray-900">검색량 추이</CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            성공/실패 검색 추이 (최근 7일)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-80 w-full">
            {loading ? (
              <ChartSkeleton />
            ) : searchVolumeData.length === 0 ? (
              <NoDataMessage />
            ) : (
              <SearchVolumeChart data={searchVolumeData} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
})