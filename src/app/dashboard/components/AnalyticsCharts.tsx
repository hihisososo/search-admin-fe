import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import {
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
  <div className="h-full w-full p-2">
    <Skeleton className="h-full w-full" />
  </div>
))

ChartSkeleton.displayName = 'ChartSkeleton'

const formatDateTick = (value: string) => {
  const date = new Date(value)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const date = new Date(label)
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`
    
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-xs">
        <p className="font-medium text-gray-700 mb-1">{formattedDate}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-gray-600" style={{ color: entry.color }}>
            {entry.name}: {entry.name.includes('시간') ? `${entry.value}ms` : entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const ResponseTimeChart = memo(({ data }: { data: ResponseTimeData[] }) => (
  <ChartContainer config={{ responseTime: CHART_CONFIG.responseTime }} className="h-full w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
        <defs>
          <linearGradient id="responseTimeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_CONFIG.responseTime.color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_CONFIG.responseTime.color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          tickFormatter={formatDateTick}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={11}
          label={{ value: 'ms', position: 'insideLeft', style: { fontSize: 11 } }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          dataKey="responseTime"
          name="응답시간"
          type="monotone"
          stroke={CHART_CONFIG.responseTime.color}
          strokeWidth={2}
          fill="url(#responseTimeGradient)"
        />
      </AreaChart>
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
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
        <defs>
          <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_CONFIG.successfulSearches.color} stopOpacity={0.8} />
            <stop offset="95%" stopColor={CHART_CONFIG.successfulSearches.color} stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="failGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_CONFIG.failedSearches.color} stopOpacity={0.8} />
            <stop offset="95%" stopColor={CHART_CONFIG.failedSearches.color} stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          tickFormatter={formatDateTick}
        />
        <YAxis 
          tickLine={false} 
          axisLine={false} 
          fontSize={11}
          label={{ value: '검색 횟수', position: 'insideLeft', style: { fontSize: 11 } }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          dataKey="successfulSearches"
          name="성공"
          stackId="1"
          stroke={CHART_CONFIG.successfulSearches.color}
          fill="url(#successGradient)"
          strokeWidth={2}
        />
        <Area
          dataKey="failedSearches"
          name="실패"
          stackId="1"
          stroke={CHART_CONFIG.failedSearches.color}
          fill="url(#failGradient)"
          strokeWidth={2}
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">검색 응답시간</CardTitle>
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

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">검색량 추이</CardTitle>
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