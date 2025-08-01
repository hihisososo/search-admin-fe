import { memo } from 'react'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Clock, AlertTriangle, Database, Activity } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { StatItem } from '@/types/dashboard'

interface StatsCardsProps {
  stats: StatItem[]
  loading: boolean
}

interface StatConfig {
  icon: LucideIcon
  colorClass: string
  bgGradient: string
}

const STAT_CONFIG: Record<string, StatConfig> = {
  검색량: {
    icon: Search,
    colorClass: 'text-blue-600',
    bgGradient: 'from-blue-100 to-blue-200',
  },
  문서량: {
    icon: Database,
    colorClass: 'text-green-600',
    bgGradient: 'from-green-100 to-green-200',
  },
  검색실패: {
    icon: AlertTriangle,
    colorClass: 'text-red-600',
    bgGradient: 'from-red-100 to-red-200',
  },
  에러건수: {
    icon: AlertTriangle,
    colorClass: 'text-orange-600',
    bgGradient: 'from-orange-100 to-orange-200',
  },
  평균응답시간: {
    icon: Clock,
    colorClass: 'text-indigo-600',
    bgGradient: 'from-indigo-100 to-indigo-200',
  },
  성공률: {
    icon: Activity,
    colorClass: 'text-emerald-600',
    bgGradient: 'from-emerald-100 to-emerald-200',
  },
}

const StatCardSkeleton = memo(() => (
  <Card className="border-0 shadow-lg">
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

StatCardSkeleton.displayName = 'StatCardSkeleton'

const StatCard = memo(({ stat }: { stat: StatItem }) => {
  const config = STAT_CONFIG[stat.label] || {
    icon: Activity,
    colorClass: 'text-gray-600',
    bgGradient: 'from-gray-100 to-gray-200',
  }
  const Icon = config.icon

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50/50 group-hover:from-white group-hover:to-blue-50/30 transition-all duration-300" />
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Icon className={`h-5 w-5 ${config.colorClass}`} />
              <CardDescription className="text-sm font-medium text-gray-600">
                {stat.label}
              </CardDescription>
            </div>
            <CardTitle className={`text-2xl font-bold ${config.colorClass} group-hover:scale-105 transition-transform duration-200`}>
              {stat.value}
            </CardTitle>
          </div>
          <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${config.bgGradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
            <Icon className={`h-5 w-5 ${config.colorClass}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

StatCard.displayName = 'StatCard'

export default memo(function StatsCards({ stats, loading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {loading
        ? Array.from({ length: 6 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))
        : stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
    </div>
  )
})