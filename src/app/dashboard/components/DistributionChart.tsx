import { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { PieChart } from 'lucide-react'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface IndexDistribution {
  name: string
  value: number
  color: string
}

interface DistributionChartProps {
  data: IndexDistribution[]
  loading: boolean
}

const DistributionSkeleton = memo(() => (
  <>
    <div className="flex-1">
      <div className="flex items-center justify-center h-80">
        <Skeleton className="h-64 w-64 rounded-full" />
      </div>
    </div>
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-8" />
        </div>
      ))}
    </div>
  </>
))

DistributionSkeleton.displayName = 'DistributionSkeleton'

const LegendItem = memo(({ item }: { item: IndexDistribution }) => (
  <div className="flex items-center space-x-3">
    <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
    <span className="text-sm font-medium text-gray-700 w-16">{item.name}</span>
    <span className="text-sm text-gray-500 font-mono">{item.value}%</span>
  </div>
))

LegendItem.displayName = 'LegendItem'

const formatLabel = ({ name, value }: { name: string; value: number }) => `${name}: ${value}%`

export default memo(function DistributionChart({ data, loading }: DistributionChartProps) {
  const chartConfig = data.reduce(
    (acc, item) => ({
      ...acc,
      [item.name]: { label: item.name, color: item.color },
    }),
    {}
  )

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <PieChart className="h-5 w-5 text-purple-500" />
          <CardTitle className="text-xl font-semibold text-gray-900">
            인덱스별 검색 분포
          </CardTitle>
        </div>
        <CardDescription className="text-gray-600">인덱스별 검색량 비율</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
          {loading ? (
            <DistributionSkeleton />
          ) : (
            <>
              <div className="flex-1">
                <ChartContainer config={chartConfig} className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={formatLabel}
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="space-y-3">
                {data.map((item) => (
                  <LegendItem key={item.name} item={item} />
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
})