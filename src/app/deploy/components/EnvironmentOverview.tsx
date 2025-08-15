import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Server, Database, Calendar, Activity, RefreshCw, Rocket, Loader2 } from 'lucide-react'
import type { Environment } from '@/types/deploy'

interface EnvironmentOverviewProps {
  environments: Environment[]
  onDeploy: (description?: string) => void
  onReindex: (environment: Environment, description?: string) => void
  isIndexing: boolean
  isDeploying: boolean
}

export default function EnvironmentOverview({ 
  environments, 
  onDeploy, 
  onReindex, 
  isIndexing: _isIndexing,
  isDeploying 
}: EnvironmentOverviewProps) {
  // 디버깅용: 환경 정보가 업데이트 될 때마다 로그
  useEffect(() => {
    const devEnv = environments.find(env => env.environmentType === 'DEV')
    if (devEnv && (devEnv.isIndexing || devEnv.indexStatus === 'IN_PROGRESS')) {
      console.log('DEV 환경 색인 상태:', {
        isIndexing: devEnv.isIndexing,
        indexStatus: devEnv.indexStatus,
        progress: devEnv.indexingProgress,
        indexed: devEnv.indexedDocumentCount,
        total: devEnv.totalDocumentCount
      })
    }
  }, [environments])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusColor = (status: Environment['indexStatus']) => {
    switch (status) {
      case 'COMPLETED':
      case 'ACTIVE':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-600 border-blue-200'
      case 'FAILED':
        return 'bg-red-50 text-red-600 border-red-200'
      default:
        return 'bg-gray-50 text-gray-500 border-gray-200'
    }
  }

  const getDevelopmentEnvironment = () => {
    return environments.find(env => env.environmentType === 'DEV')
  }

  // 색인 중인지 확인하는 명확한 함수
  const isEnvironmentIndexing = (env: Environment) => {
    return env.indexStatus === 'IN_PROGRESS' || env.isIndexing
  }

  const canDeploy = () => {
    const devEnv = getDevelopmentEnvironment()
    
    return devEnv && 
           (devEnv.indexStatus === 'COMPLETED' || devEnv.indexStatus === 'ACTIVE') && 
           !isEnvironmentIndexing(devEnv) && 
           !isDeploying
  }

  const canReindex = (env: Environment) => {
    return env.environmentType === 'DEV' && 
           !isEnvironmentIndexing(env) && 
           !isDeploying
    // 실패 상태에서도 재실행 가능하도록 FAILED 체크 제거
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {environments
        .sort((a, b) => {
          // 개발 환경을 먼저, 운영 환경을 나중에 표시
          if (a.environmentType === 'DEV' && b.environmentType === 'PROD') return -1
          if (a.environmentType === 'PROD' && b.environmentType === 'DEV') return 1
          return 0
        })
        .map((env) => (
        <Card key={env.environmentType} className="relative shadow-sm border-gray-200">
          <CardHeader className="pt-1 pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="h-4 w-4 text-gray-600" />
                {env.environmentDescription}
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(env.indexStatus)}`}
                >
                  {env.indexStatusDescription}
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
                    <span className="text-gray-400">상품: </span>
                    <span>{env.indexName}</span>
                    {env.autocompleteIndexName && (
                      <>
                        <span className="text-gray-400"> · 자동완성: </span>
                        <span>{env.autocompleteIndexName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Activity className="h-3 w-3 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-600 font-medium">문서 수</div>
                  <div className="text-xs text-gray-500">
                    {formatNumber(env.documentCount)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
              <Calendar className="h-3 w-3 text-gray-400" />
              <div className="text-xs text-gray-500">
                {formatDate(env.indexDate)}
              </div>
            </div>

            {/* 색인 진행률 표시 */}
            {env.environmentType === 'DEV' && isEnvironmentIndexing(env) && env.indexingProgress !== null && env.indexingProgress !== undefined && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">색인 진행중</span>
                  <span className="font-semibold text-blue-600">{env.indexingProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${env.indexingProgress}%` }}
                  />
                </div>
                {env.indexedDocumentCount !== null && env.indexedDocumentCount !== undefined && 
                 env.totalDocumentCount !== null && env.totalDocumentCount !== undefined && (
                  <div className="text-xs text-gray-500 text-center">
                    {formatNumber(env.indexedDocumentCount)} / {formatNumber(env.totalDocumentCount)} 문서
                  </div>
                )}
              </div>
            )}

            {/* 개발 환경에만 버튼들 표시 */}
            {env.environmentType === 'DEV' && (
              <div className="flex gap-2 pt-1">
                <Button
                  onClick={() => onReindex(env)}
                  variant="outline"
                  size="sm"
                  disabled={!canReindex(env)}
                  className="flex-1 text-xs h-8"
                >
                  {isEnvironmentIndexing(env) ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      색인중 ({env.indexingProgress}%)
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      색인
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => onDeploy()}
                  disabled={isDeploying || !canDeploy()}
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
            )}
          </CardContent>
          
          {/* 환경 타입 표시 */}
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