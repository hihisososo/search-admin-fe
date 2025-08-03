import { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
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
    color: '#4f46e5',
  },
  successfulSearches: {
    label: '성공',
    color: '#10b981',
  },
  failedSearches: {
    label: '실패',
    color: '#ef4444',
  },
} as const

const ChartSkeleton = memo(() => (
  <div className="h-full w-full p-4">
    <Skeleton className="h-full w-full" />
  </div>
))

ChartSkeleton.displayName = 'ChartSkeleton'

const formatDateTick = (value: string) => value.slice(5)

const ResponseTimeChart = memo(({ data }: { data: ResponseTimeData[] }) => (
  <ChartContainer config={{ responseTime: CHART_CONFIG.responseTime }} className="h-full w-full">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={formatDateTick}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <Tooltip />
        <Line
          dataKey="responseTime"
          type="monotone"
          stroke={CHART_CONFIG.responseTime.color}
          strokeWidth={2}
          dot={false}
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
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={formatDateTick}
        />
        <YAxis 
          tickLine={false} 
          axisLine={false} 
          fontSize={12}
        />
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">검색 응답시간</CardTitle>
          <CardDescription className="text-sm">
            최근 7일간 평균 응답시간 (ms)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {loading ? (
              <ChartSkeleton />
            ) : responseTimeData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                데이터 없음
              </div>
            ) : (
              <ResponseTimeChart data={responseTimeData} />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">검색량 추이</CardTitle>
          <CardDescription className="text-sm">
            성공/실패 검색 건수
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {loading ? (
              <ChartSkeleton />
            ) : searchVolumeData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                데이터 없음
              </div>
            ) : (
              <SearchVolumeChart data={searchVolumeData} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
})