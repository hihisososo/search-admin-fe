import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Clock, AlertTriangle, Database, Activity, MousePointerClick, TrendingUp, BarChart3 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { StatItem } from '@/types/dashboard'

interface StatsCardsProps {
  stats: StatItem[]
  loading: boolean
}

interface StatConfig {
  icon: LucideIcon
  gradient: string
  iconColor: string
  bgPattern?: string
  trend?: {
    value: string
    isPositive: boolean
  }
}

const STAT_CONFIG: Record<string, StatConfig> = {
  검색량: {
    icon: Search,
    gradient: 'from-blue-500 to-blue-600',
    iconColor: 'text-blue-600',
    bgPattern: 'bg-blue-50',
  },
  문서량: {
    icon: Database,
    gradient: 'from-emerald-500 to-emerald-600',
    iconColor: 'text-emerald-600',
    bgPattern: 'bg-emerald-50',
  },
  검색실패: {
    icon: AlertTriangle,
    gradient: 'from-red-500 to-red-600',
    iconColor: 'text-red-600',
    bgPattern: 'bg-red-50',
  },
  에러건수: {
    icon: AlertTriangle,
    gradient: 'from-orange-500 to-orange-600',
    iconColor: 'text-orange-600',
    bgPattern: 'bg-orange-50',
  },
  평균응답시간: {
    icon: Clock,
    gradient: 'from-indigo-500 to-indigo-600',
    iconColor: 'text-indigo-600',
    bgPattern: 'bg-indigo-50',
  },
  성공률: {
    icon: Activity,
    gradient: 'from-green-500 to-green-600',
    iconColor: 'text-green-600',
    bgPattern: 'bg-green-50',
  },
  클릭수: {
    icon: MousePointerClick,
    gradient: 'from-purple-500 to-purple-600',
    iconColor: 'text-purple-600',
    bgPattern: 'bg-purple-50',
  },
  CTR: {
    icon: BarChart3,
    gradient: 'from-cyan-500 to-cyan-600',
    iconColor: 'text-cyan-600',
    bgPattern: 'bg-cyan-50',
  },
}

const StatCardSkeleton = memo(() => (
  <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border-0 shadow-lg">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-14 w-14 rounded-2xl" />
      </div>
    </CardContent>
  </Card>
))

StatCardSkeleton.displayName = 'StatCardSkeleton'

const StatCard = memo(({ stat }: { stat: StatItem }) => {
  const config = STAT_CONFIG[stat.label] || {
    icon: Activity,
    gradient: 'from-gray-500 to-gray-600',
    iconColor: 'text-gray-600',
    bgPattern: 'bg-gray-50',
  }
  const Icon = config.icon

  // 임시 트렌드 데이터 (실제로는 API에서 받아와야 함)
  const getTrend = (label: string) => {
    const trends: Record<string, { value: string; isPositive: boolean }> = {
      검색량: { value: '+12.5%', isPositive: true },
      문서량: { value: '+3.2%', isPositive: true },
      검색실패: { value: '-2.1%', isPositive: true },
      에러건수: { value: '-15.3%', isPositive: true },
      평균응답시간: { value: '-8.7%', isPositive: true },
      성공률: { value: '+1.2%', isPositive: true },
      클릭수: { value: '+18.9%', isPositive: true },
      CTR: { value: '+5.4%', isPositive: true },
    }
    return trends[label] || null
  }

  const trend = getTrend(stat.label)

  return (
    <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-gray-200 to-gray-300" />
        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300" />
      </div>

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              {trend && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {trend.value}
                </span>
              )}
            </div>
            
            <p className="text-3xl font-bold text-gray-900 tracking-tight">
              {stat.value}
            </p>

            {trend && (
              <div className="flex items-center gap-1">
                <TrendingUp className={`h-3 w-3 ${trend.isPositive ? 'text-green-500' : 'text-red-500 rotate-180'}`} />
                <span className="text-xs text-gray-500">전일 대비</span>
              </div>
            )}
          </div>

          <div className={`p-4 rounded-2xl bg-gradient-to-br ${config.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* 하단 차트 미리보기 (실제로는 데이터 기반으로 그려야 함) */}
        <div className="mt-4 h-12 flex items-end gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 ${config.bgPattern} rounded-t`}
              style={{ height: `${Math.random() * 100}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
})

StatCard.displayName = 'StatCard'

export default memo(function StatsCards({ stats, loading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {loading
        ? Array.from({ length: 8 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))
        : stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
    </div>
  )
})