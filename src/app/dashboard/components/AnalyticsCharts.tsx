import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
} from 'recharts'

interface AnalyticsChartsProps {
  responseTimeData: Array<{ date: string; [key: string]: string | number }>
  searchVolumeData: Array<{ date: string; [key: string]: string | number }>
  loading: boolean
}

const formatDate = (value: string) => {
  const date = new Date(value)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-xs">
      <p className="font-medium text-gray-700 mb-1">{formatDate(label)}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-gray-600" style={{ color: entry.color }}>
          {entry.name}: {
            String(entry.name).includes('시간')
              ? `${entry.value}ms`
              : Number(entry.value).toLocaleString()
          }
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsCharts({
  responseTimeData,
  searchVolumeData,
  loading,
}: AnalyticsChartsProps) {
  const renderChart = (
    data: any[],
    lines: Array<{ key: string; name: string; color: string }>,
    title: string
  ) => (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {loading ? (
            <div className="h-full w-full p-2">
              <Skeleton className="h-full w-full" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              데이터 없음
            </div>
          ) : (
            <ChartContainer
              config={lines.reduce((acc, line) => ({
                ...acc,
                [line.key]: { label: line.name, color: line.color }
              }), {})}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 10, right: 10, left: -5, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    tickFormatter={formatDate}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    width={35}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {lines.map(line => (
                    <Line
                      key={line.key}
                      dataKey={line.key}
                      name={line.name}
                      type="monotone"
                      stroke={line.color}
                      strokeWidth={2}
                      dot={{ fill: line.color, r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {renderChart(
        searchVolumeData,
        [
          { key: 'successfulSearches', name: '성공', color: '#10b981' },
          { key: 'failedSearches', name: '실패', color: '#ef4444' }
        ],
        '검색량 추이'
      )}
      {renderChart(
        responseTimeData,
        [{ key: 'responseTime', name: '응답시간', color: '#4f46e5' }],
        '검색 응답시간'
      )}
    </div>
  )
}