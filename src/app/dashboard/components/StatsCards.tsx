import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Clock, AlertTriangle, Database, Activity } from "lucide-react";
import type { StatItem } from "@/types/dashboard";

interface StatsCardsProps {
  stats: StatItem[];
  loading: boolean;
}

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  // 통계 카드 아이콘 매핑
  const getStatIcon = (label: string) => {
    switch (label) {
      case "검색량": return <Search className="h-5 w-5 text-blue-500" />;
      case "문서량": return <Database className="h-5 w-5 text-green-500" />;
      case "검색실패": return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "에러건수": return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "평균응답시간": return <Clock className="h-5 w-5 text-indigo-500" />;
      case "성공률": return <Activity className="h-5 w-5 text-emerald-500" />;
      default: return null;
    }
  };

  // 통계값에 따른 색상 결정
  const getStatValueColor = (label: string) => {
    switch (label) {
      case "검색량": return "text-blue-600";
      case "문서량": return "text-green-600";
      case "검색실패": return "text-red-600";
      case "에러건수": return "text-orange-600";
      case "평균응답시간": return "text-indigo-600";
      case "성공률": return "text-emerald-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {loading ? (
        Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        stats.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50/50 group-hover:from-white group-hover:to-blue-50/30 transition-all duration-300" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {getStatIcon(stat.label)}
                    <CardDescription className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </CardDescription>
                  </div>
                  <CardTitle className={`text-2xl font-bold ${getStatValueColor(stat.label)} group-hover:scale-105 transition-transform duration-200`}>
                    {stat.value}
                  </CardTitle>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  {getStatIcon(stat.label)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
} 