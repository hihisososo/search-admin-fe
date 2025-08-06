import { useState, useEffect, useCallback } from 'react'
import type { Environment, DeployHistory } from '@/types/deploy'
import { deploymentService } from '@/services'
import { useToast } from '@/components/ui/use-toast'
import { logger } from '@/lib/logger'
import EnvironmentOverview from './components/EnvironmentOverview'
import DeploymentHistory from './components/DeploymentHistory'

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('ko-KR').format(num)
}

export default function DeployManagement() {
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [deployHistory, setDeployHistory] = useState<DeployHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isIndexing, setIsIndexing] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const { toast } = useToast()

  // 개발 환경이 색인 중인지 확인하는 헬퍼 함수
  const checkIfIndexing = (envs: Environment[]) => {
    const devEnv = envs.find(env => env.environmentType === 'DEV')
    // indexStatus가 'IN_PROGRESS'이면 색인 중
    return devEnv?.indexStatus === 'IN_PROGRESS' || devEnv?.isIndexing || false
  }

  // 환경 정보 조회
  const fetchEnvironments = useCallback(async () => {
    try {
      const response = await deploymentService.getEnvironments()
      setEnvironments(response.environments)
      
      // 백엔드 상태로 로컬 색인 상태 동기화
      const isCurrentlyIndexing = checkIfIndexing(response.environments)
      setIsIndexing(isCurrentlyIndexing)
      
      return response.environments
    } catch (error) {
      logger.error('환경 정보 조회 실패', error as Error)
      return []
    }
  }, [])

  // 배포 이력 조회
  const fetchDeploymentHistory = useCallback(async () => {
    try {
      const response = await deploymentService.getDeploymentHistory({
        page: 0,
        size: 20,
        sort: 'createdAt,desc'
      })
      setDeployHistory(response.deploymentHistories)
    } catch (error) {
      logger.error('배포 이력 조회 실패', error as Error)
    }
  }, [])

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      const envs = await fetchEnvironments()
      await fetchDeploymentHistory()
      
      // 페이지 로드 시 색인 중이면 모니터링 시작
      if (checkIfIndexing(envs)) {
        logger.info('페이지 로드 시 색인이 진행 중입니다. 모니터링을 시작합니다.')
        startIndexingMonitoring()
      }
      
      setIsLoading(false)
    }

    loadInitialData()
  }, [fetchEnvironments, fetchDeploymentHistory])

  // 색인 실행 (개발환경만)
  const handleReindex = async (environment: Environment, description?: string) => {
    if (environment.environmentType !== 'DEV') return
    
    setIsIndexing(true)
    try {
      const response = await deploymentService.executeIndexing({ description })
      if (response.success) {
        logger.info('색인 시작', { message: response.message })
        toast({
          title: "색인 시작",
          description: "색인이 시작되었습니다. 진행 상황을 모니터링합니다.",
          variant: "default"
        })
        // 즉시 환경 상태 새로고침 후 모니터링 시작
        await fetchEnvironments()
        startIndexingMonitoring()
      } else {
        logger.error('색인 실패', new Error(response.message))
        toast({
          title: "색인 실패",
          description: response.message,
          variant: "destructive"
        })
        setIsIndexing(false)
      }
    } catch (error) {
      logger.error('색인 요청 실패', error as Error)
      toast({
          title: "네트워크 오류",
          description: "색인 요청 중 오류가 발생했습니다. 다시 시도해주세요.",
          variant: "destructive"
        })
      setIsIndexing(false)
    }
  }

  // 배포 실행
  const handleDeploy = async (description?: string) => {
    setIsDeploying(true)
    try {
      const response = await deploymentService.executeDeploy({ description })
      if (response.success) {
        logger.info('배포 완료', { message: response.message })
        toast({
          title: "배포 완료",
          description: `운영 환경으로 배포가 완료되었습니다. (버전: ${response.version})`,
          variant: "default"
        })
        // 환경 정보 및 이력 새로고침
        await Promise.all([
          fetchEnvironments(),
          fetchDeploymentHistory()
        ])
      } else {
        logger.error('배포 실패', new Error(response.message))
        toast({
          title: "배포 실패",
          description: response.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      logger.error('배포 요청 실패', error as Error)
      toast({
        title: "배포 요청 실패",
        description: "네트워크 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      })
    } finally {
      setIsDeploying(false)
    }
  }

  // 색인 진행 상황 모니터링 - 백엔드 상태 우선
  const startIndexingMonitoring = useCallback(() => {
    const checkStatus = async () => {
      try {
        const response = await deploymentService.getEnvironments()
        const devEnv = response.environments.find(env => env.environmentType === 'DEV')
        
        // 즉시 상태 업데이트
        setEnvironments(response.environments)
        
        // 진행률 로그 (디버깅용)
        if (devEnv?.indexingProgress !== null && devEnv?.indexingProgress !== undefined) {
          logger.debug('색인 진행률', { 
            progress: devEnv.indexingProgress,
            indexed: devEnv.indexedDocumentCount,
            total: devEnv.totalDocumentCount
          })
        }
        
        // 백엔드 상태 기준으로 판단
        const backendIndexing = !!(devEnv?.indexStatus === 'IN_PROGRESS' || devEnv?.isIndexing)
        setIsIndexing(backendIndexing)
        
        if (devEnv && !backendIndexing && (devEnv.indexStatus === 'COMPLETED' || devEnv.indexStatus === 'ACTIVE')) {
          // 색인 완료
          await fetchDeploymentHistory()
          logger.info('색인 완료!')
          toast({
            title: "색인 완료",
            description: `색인이 성공적으로 완료되었습니다. (${formatNumber(devEnv.documentCount)}개 문서)`,
            variant: "default"
          })
          return true
        }
        
        if (devEnv && !backendIndexing && devEnv.indexStatus === 'FAILED') {
          // 색인 실패
          logger.error('색인 실패!')
          toast({
            title: "색인 실패",
            description: "색인이 실패했습니다. 다시 시도해주세요.",
            variant: "destructive"
          })
          return true
        }
        
        return false
      } catch (error) {
        logger.error('상태 확인 실패', error as Error)
        return true
      }
    }

    const interval = setInterval(async () => {
      const isCompleted = await checkStatus()
      if (isCompleted) {
        clearInterval(interval)
        setIsIndexing(false)
      }
    }, 1000) // 1초마다 체크

    // 5분 후 자동 중단
    setTimeout(() => {
      clearInterval(interval)
      setIsIndexing(false)
      logger.warn('색인 모니터링 시간 초과로 중단됨')
    }, 300000)
  }, [fetchDeploymentHistory])

  if (isLoading) {
    return (
      <div className="p-5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-10">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 space-y-5">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* 환경 개요 */}
        <EnvironmentOverview 
          environments={environments}
          onDeploy={handleDeploy}
          onReindex={handleReindex}
          isIndexing={isIndexing}
          isDeploying={isDeploying}
        />

        {/* 배포 이력 */}
        <DeploymentHistory history={deployHistory} />
      </div>
    </div>
  )
} 