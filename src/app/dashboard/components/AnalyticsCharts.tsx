import { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
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
  <div className="flex flex-col items-center justify-center h-full text-gray-400">
    <BarChart3 className="h-12 w-12 mb-2 opacity-20" />
    <span className="text-sm">데이터가 없습니다</span>
  </div>
))

NoDataMessage.displayName = 'NoDataMessage'

const formatDateTick = (value: string) => value.slice(5)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

const ResponseTimeChart = memo(({ data }: { data: ResponseTimeData[] }) => {
  const avgResponseTime = data.reduce((sum, item) => sum + item.responseTime, 0) / data.length
  const trend = data[data.length - 1]?.responseTime < data[0]?.responseTime

  return (
    <div className="relative">
      {/* 트렌드 뱃지 */}
      <div className="absolute top-0 right-0 z-10">
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
          trend ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {trend ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
          평균 {avgResponseTime.toFixed(0)}ms
        </div>
      </div>

      <ChartContainer config={{ responseTime: CHART_CONFIG.responseTime }} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="responseTimeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_CONFIG.responseTime.color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={CHART_CONFIG.responseTime.color} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickMargin={8}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={formatDateTick}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickMargin={8}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              dataKey="responseTime"
              type="monotone"
              stroke={CHART_CONFIG.responseTime.color}
              strokeWidth={3}
              dot={{
                fill: CHART_CONFIG.responseTime.color,
                strokeWidth: 2,
                stroke: '#ffffff',
                r: 5,
              }}
              activeDot={{
                r: 7,
                fill: CHART_CONFIG.responseTime.color,
                stroke: '#ffffff',
                strokeWidth: 3,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
})

ResponseTimeChart.displayName = 'ResponseTimeChart'

const SearchVolumeChart = memo(({ data }: { data: SearchVolumeData[] }) => {
  const totalSearches = data.reduce((sum, item) => sum + item.searches, 0)
  const successRate = data.reduce((sum, item) => sum + item.successfulSearches, 0) / totalSearches * 100

  return (
    <div className="relative">
      {/* 성공률 뱃지 */}
      <div className="absolute top-0 right-0 z-10">
        <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
          성공률 {successRate.toFixed(1)}%
        </div>
      </div>

      <ChartContainer
        config={{
          successfulSearches: CHART_CONFIG.successfulSearches,
          failedSearches: CHART_CONFIG.failedSearches,
        }}
        className="h-full w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_CONFIG.successfulSearches.color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={CHART_CONFIG.successfulSearches.color} stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="failGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_CONFIG.failedSearches.color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={CHART_CONFIG.failedSearches.color} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickMargin={8}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={formatDateTick}
            />
            <YAxis 
              tickLine={false} 
              axisLine={{ stroke: '#e5e7eb' }} 
              tickMargin={8} 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              dataKey="successfulSearches"
              stackId="1"
              stroke={CHART_CONFIG.successfulSearches.color}
              fill="url(#successGradient)"
              strokeWidth={2}
            />
            <Area
              dataKey="failedSearches"
              stackId="1"
              stroke={CHART_CONFIG.failedSearches.color}
              fill="url(#failGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
})

SearchVolumeChart.displayName = 'SearchVolumeChart'

export default memo(function AnalyticsCharts({
  responseTimeData,
  searchVolumeData,
  loading,
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-50" />
        <CardHeader className="relative pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Clock className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  검색 응답시간 추이
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  최근 7일간 평균 응답시간 변화
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative pt-0">
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

      <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-50" />
        <CardHeader className="relative pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  검색량 추이
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  성공/실패 검색 추이 (최근 7일)
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative pt-0">
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