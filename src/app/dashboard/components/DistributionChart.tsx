import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PieChart } from 'lucide-react'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface IndexDistribution {
  name: string
  value: number
  color: string
  ctr?: number
}

interface DistributionChartProps {
  data: IndexDistribution[]
  loading: boolean
}

export default function DistributionChart({ data, loading }: DistributionChartProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <PieChart className="h-5 w-5 text-purple-500" />
          <CardTitle className="text-xl font-semibold text-gray-900">
            검색 쿼리 분포
          </CardTitle>
        </div>
        <CardDescription className="text-gray-600">검색 쿼리별 검색량 비율</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
          {loading ? (
            <>
              <div className="flex-1">
                <div className="flex items-center justify-center h-80">
                  <Skeleton className="h-64 w-64 rounded-full" />
                </div>
              </div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={320}>
                  <RechartsPieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ payload }) => {
                        if (!payload?.[0]) return null
                        const data = payload[0].payload as IndexDistribution
                        return (
                          <div className="bg-white p-2 border rounded shadow">
                            <p className="text-sm font-medium">{data.name}</p>
                            <p className="text-sm">검색 비율: {data.value}%</p>
                            {data.ctr !== undefined && (
                              <p className="text-sm text-blue-600">CTR: {data.ctr.toFixed(1)}%</p>
                            )}
                          </div>
                        )
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {data.map((item) => (
                  <div key={item.name} className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium text-gray-700 w-16">{item.name}</span>
                    <span className="text-sm text-gray-500 font-mono">{item.value}%</span>
                    {item.ctr !== undefined && (
                      <span className="text-sm text-blue-600 font-mono">CTR: {item.ctr.toFixed(1)}%</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
