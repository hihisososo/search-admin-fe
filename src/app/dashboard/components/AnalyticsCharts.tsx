import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";
import { MESSAGES } from "@/constants/dashboard";

interface ResponseTimeData {
  date: string;
  responseTime: number;
}

interface SearchVolumeData {
  date: string;
  searches: number;
  successfulSearches: number;
  failedSearches: number;
}

interface AnalyticsChartsProps {
  responseTimeData: ResponseTimeData[];
  searchVolumeData: SearchVolumeData[];
  loading: boolean;
}

export default function AnalyticsCharts({ 
  responseTimeData, 
  searchVolumeData, 
  loading 
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 응답시간 추이 차트 */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-indigo-500" />
            <CardTitle className="text-xl font-semibold text-gray-900">검색 응답시간 추이</CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            최근 7일간 평균 응답시간 변화 (단위: ms)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-80 w-full">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
            ) : responseTimeData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-400 text-sm">{MESSAGES.NO_DATA}</span>
              </div>
            ) : (
              <ChartContainer
                config={{ 
                  responseTime: { 
                    label: "응답시간", 
                    color: "#6366f1" 
                  } 
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={responseTimeData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      className="text-sm"
                      tickFormatter={value => value.slice(3)}
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
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ 
                        fill: "#6366f1", 
                        strokeWidth: 3, 
                        stroke: "#ffffff",
                        r: 6 
                      }}
                      activeDot={{ 
                        r: 8, 
                        fill: "#6366f1", 
                        stroke: "#ffffff", 
                        strokeWidth: 3,
                        className: "drop-shadow-lg"
                      }}
                      className="drop-shadow-sm"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 검색량 추이 차트 */}
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
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
            ) : (
              <ChartContainer
                config={{
                  successfulSearches: {
                    label: "성공한 검색",
                    color: "#10b981"
                  },
                  failedSearches: {
                    label: "실패한 검색",
                    color: "#ef4444"
                  }
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={searchVolumeData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      className="text-sm"
                      tickFormatter={value => value.slice(3)}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      className="text-sm"
                    />
                    <Tooltip />
                    <Area
                      dataKey="successfulSearches"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                    />
                    <Area
                      dataKey="failedSearches"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 