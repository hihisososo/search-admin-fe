import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Server, Database, Calendar, Activity, RefreshCw, Rocket, Loader2 } from 'lucide-react'
import type { Environment } from '@/services/deployment/types'
import { config } from '@/lib/config'

interface EnvironmentOverviewProps {
  environments: Environment[]
  onDeploy: (description?: string) => void
  onReindex: (environment: Environment, description?: string) => void
  isIndexing: boolean
  indexingProgress: number
  indexingMessage: string
  isDeploying: boolean
}

const STATUS_COLORS = {
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
  ACTIVE: 'bg-green-50 text-green-700 border-green-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-600 border-blue-200',
  FAILED: 'bg-red-50 text-red-600 border-red-200'
} as const

export default function EnvironmentOverview({
  environments,
  onDeploy,
  onReindex,
  isIndexing,
  indexingProgress,
  indexingMessage,
  isDeploying
}: EnvironmentOverviewProps) {

  const formatNumber = (num: number) =>
    new Intl.NumberFormat('ko-KR').format(num)

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))

  const getStatusColor = (status: Environment['indexStatus']) =>
    STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-50 text-gray-500 border-gray-200'

  const isEnvironmentIndexing = (env: Environment) =>
    env.environmentType === 'DEV' && isIndexing

  const canDeploy = (env: Environment) =>
    env.environmentType === 'DEV' &&
    env.indexStatus === 'ACTIVE' &&
    !isIndexing &&
    !isDeploying

  const canReindex = (env: Environment) =>
    env.environmentType === 'DEV' &&
    !isEnvironmentIndexing(env) &&
    !isDeploying

  const handleProductionAlert = () => {
    if (config.isProduction()) {
      alert('죄송하지만, 프로덕션 환경에서 임의 색인 및 배포는 막아놨습니다.')
      return true
    }
    return false
  }

  const sortedEnvironments = [...environments].sort((a, b) => {
    if (a.environmentType === 'DEV') return -1
    if (b.environmentType === 'DEV') return 1
    return 0
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sortedEnvironments.map((env) => (
        <Card key={env.environmentType} className="relative shadow-sm border-gray-200">
          <CardHeader className="pt-1 pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="h-4 w-4 text-gray-600" />
                {env.environmentDescription}
                <Badge
                  variant="outline"
                  className={`text-xs ${isEnvironmentIndexing(env) ? 'bg-blue-50 text-blue-600 border-blue-200' : getStatusColor(env.indexStatus)}`}
                >
                  {isEnvironmentIndexing(env) ? '색인 중' : env.indexStatusDescription}
                  {isEnvironmentIndexing(env) && (
                    <Loader2 className="h-3 w-3 ml-1 animate-spin" />
                  )}
                </Badge>
              </CardTitle>
              <div className="text-xs text-gray-500 font-mono">
                {env.version}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0 pb-2">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Database className="h-3 w-3 text-gray-400 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-600 font-medium">색인명</div>
                  <div className="text-xs text-gray-500 break-all font-mono leading-snug">
                    {env.indexStatus === 'ACTIVE' ? (
                      <>
                        <span className="text-gray-400">상품: </span>
                        <span>{env.indexName}</span>
                        {env.autocompleteIndexName && (
                          <>
                            <span className="text-gray-400"> · 자동완성: </span>
                            <span>{env.autocompleteIndexName}</span>
                          </>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Activity className="h-3 w-3 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-600 font-medium">문서 수</div>
                  <div className="text-xs text-gray-500">
                    {env.indexStatus === 'ACTIVE' ? formatNumber(env.documentCount) : '-'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
              <Calendar className="h-3 w-3 text-gray-400" />
              <div className="text-xs text-gray-500">
                {env.indexStatus === 'ACTIVE' ? formatDate(env.indexDate) : '-'}
              </div>
            </div>

            {env.environmentType === 'DEV' && isEnvironmentIndexing(env) && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 truncate flex-1 mr-2">{indexingMessage}</span>
                  <span className="font-semibold text-blue-600">{indexingProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${indexingProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                onClick={() => !handleProductionAlert() && onReindex(env, "색인 실행")}
                variant="outline"
                size="sm"
                disabled={!canReindex(env)}
                className="flex-1 text-xs h-8"
              >
                {isEnvironmentIndexing(env) ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    색인중 ({indexingProgress}%)
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    색인
                  </>
                )}
              </Button>
              <Button
                onClick={() => !handleProductionAlert() && onDeploy()}
                disabled={isDeploying || !canDeploy(env)}
                variant="outline"
                size="sm"
                className="flex-1 text-xs h-8"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    배포중
                  </>
                ) : (
                  <>
                    <Rocket className="h-3 w-3 mr-1" />
                    배포
                  </>
                )}
              </Button>
            </div>
          </CardContent>

          <div
            className={`absolute left-0 top-0 w-0.5 h-full ${
              env.environmentType === 'PROD' ? 'bg-gray-800' : 'bg-gray-500'
            }`}
          />
        </Card>
      ))}
    </div>
  )
}