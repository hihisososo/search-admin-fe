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
import type { ResponseTimeChartData } from '@/services/dashboard/types'
import { formatDate } from './chart-utils'
import { CustomTooltip } from './ChartTooltip'

interface ResponseTimeChartProps {
  data: ResponseTimeChartData[]
  loading: boolean
}

export default function ResponseTimeChart({ data, loading }: ResponseTimeChartProps) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">검색 응답시간</CardTitle>
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
              config={{
                responseTime: { label: '응답시간', color: '#4f46e5' }
              }}
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
                  <Line
                    dataKey="responseTime"
                    name="응답시간"
                    type="monotone"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={{ fill: '#4f46e5', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}