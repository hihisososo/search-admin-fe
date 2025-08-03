import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Clock, AlertTriangle, Database, Activity, MousePointerClick, BarChart3 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { StatItem } from '@/types/dashboard'

interface StatsCardsProps {
  stats: StatItem[]
  loading: boolean
}

interface StatConfig {
  icon: LucideIcon
  color: string
}

const STAT_CONFIG: Record<string, StatConfig> = {
  검색량: {
    icon: Search,
    color: 'text-blue-600',
  },
  문서량: {
    icon: Database,
    color: 'text-green-600',
  },
  검색실패: {
    icon: AlertTriangle,
    color: 'text-red-600',
  },
  에러건수: {
    icon: AlertTriangle,
    color: 'text-orange-600',
  },
  평균응답시간: {
    icon: Clock,
    color: 'text-indigo-600',
  },
  성공률: {
    icon: Activity,
    color: 'text-emerald-600',
  },
  클릭수: {
    icon: MousePointerClick,
    color: 'text-purple-600',
  },
  CTR: {
    icon: BarChart3,
    color: 'text-cyan-600',
  },
}

const StatCardSkeleton = memo(() => (
  <Card>
    <CardContent className="p-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-6 w-6 rounded" />
      </div>
    </CardContent>
  </Card>
))

StatCardSkeleton.displayName = 'StatCardSkeleton'

const StatCard = memo(({ stat }: { stat: StatItem }) => {
  const config = STAT_CONFIG[stat.label] || {
    icon: Activity,
    color: 'text-gray-600',
  }
  const Icon = config.icon

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-lg font-semibold">{stat.value}</p>
          </div>
          <Icon className={`h-6 w-6 ${config.color} opacity-20`} />
        </div>
      </CardContent>
    </Card>
  )
})

StatCard.displayName = 'StatCard'

export default memo(function StatsCards({ stats, loading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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