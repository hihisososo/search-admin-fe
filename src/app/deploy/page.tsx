import { useState, useEffect, useCallback } from 'react'
import type { Environment, DeployHistory } from '@/types/deploy'
import { deploymentService, taskService } from '@/services'
import { useToast } from '@/components/ui/use-toast'
import { logger } from '@/lib/logger'

// 색인 모니터링 타임아웃 설정 (15분)
const INDEXING_MONITOR_TIMEOUT = 60 * 60 * 1000
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
  const [indexingProgress, setIndexingProgress] = useState<number>(0)
  const [indexingMessage, setIndexingMessage] = useState<string>('')
  const [isDeploying, setIsDeploying] = useState(false)
  const { toast } = useToast()

  // 환경 정보 조회
  const fetchEnvironments = useCallback(async () => {
    try {
      const response = await deploymentService.getEnvironments()
      setEnvironments(response.environments)
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

  // 색인 진행 상황 모니터링 - Task API 사용 (useCallback으로 먼저 정의)
  const startIndexingMonitoring = useCallback((taskId: number) => {
    const checkStatus = async () => {
      try {
        const task = await taskService.getTask(taskId)
        
        // 진행률 로그
        logger.debug('색인 진행률', { 
          taskId: task.id,
          progress: task.progress,
          status: task.status,
          message: task.message
        })
        
        // 진행 중인 경우 환경 정보 업데이트 및 진행률 업데이트
        if (task.status === 'IN_PROGRESS') {
          setIndexingProgress(task.progress || 0)
          setIndexingMessage(task.message || '색인 처리 중...')
          await fetchEnvironments()
          return false
        }
        
        // 완료된 경우
        if (task.status === 'COMPLETED') {
          await Promise.all([
            fetchEnvironments(),
            fetchDeploymentHistory()
          ])
          
          // 결과 파싱
          let documentCount = 0
          if (task.result) {
            try {
              const result = JSON.parse(task.result)
              documentCount = result.documentCount || 0
            } catch (e) {
              logger.error('색인 결과 파싱 실패', e as Error)
            }
          }
          
          logger.info('색인 완료!', { taskId: task.id, documentCount })
          toast({
            title: "색인 완료",
            description: `색인이 성공적으로 완료되었습니다. ${documentCount > 0 ? `(${formatNumber(documentCount)}개 문서)` : ''}`,
            variant: "default"
          })
          return true
        }
        
        // 실패한 경우
        if (task.status === 'FAILED') {
          await fetchEnvironments()
          logger.error('색인 실패!', { taskId: task.id, error: task.errorMessage })
          toast({
            title: "색인 실패",
            description: task.errorMessage || "색인이 실패했습니다. 다시 시도해주세요.",
            variant: "destructive"
          })
          return true
        }
        
        return false
      } catch (error) {
        logger.error('Task 상태 확인 실패', error as Error)
        return true
      }
    }

    const interval = setInterval(async () => {
      const isCompleted = await checkStatus()
      if (isCompleted) {
        clearInterval(interval)
        setIsIndexing(false)
        setIndexingProgress(0)
        setIndexingMessage('')
      }
    }, 3000) // 3초마다 체크

    // 타임아웃 후 자동 중단
    const timeoutId = setTimeout(() => {
      clearInterval(interval)
      setIsIndexing(false)
      setIndexingProgress(0)
      setIndexingMessage('')
      logger.warn(`색인 모니터링 시간 초과로 중단됨 (${INDEXING_MONITOR_TIMEOUT / 1000 / 60}분)`)
    }, INDEXING_MONITOR_TIMEOUT)
    
    // 정리 함수
    return () => {
      clearInterval(interval)
      clearTimeout(timeoutId)
    }
  }, [fetchEnvironments, fetchDeploymentHistory, toast, setIndexingProgress, setIndexingMessage])

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      await fetchEnvironments()
      await fetchDeploymentHistory()
      
      // 실행 중인 색인 작업 확인
      try {
        const runningTasks = await taskService.getRunningTasks()
        const indexingTask = runningTasks.find(task => task.taskType === 'INDEXING')
        
        if (indexingTask) {
          logger.info('실행 중인 색인 작업을 감지했습니다. 모니터링을 시작합니다.', { taskId: indexingTask.id })
          setIsIndexing(true)
          setIndexingProgress(indexingTask.progress || 0)
          setIndexingMessage(indexingTask.message || '색인 처리 중...')
          startIndexingMonitoring(indexingTask.id)
        }
      } catch (error) {
        logger.error('실행 중인 작업 조회 실패', error as Error)
      }
      
      setIsLoading(false)
    }

    loadInitialData()
  }, [fetchEnvironments, fetchDeploymentHistory])

  // 색인 실행
  const handleReindex = async (environment: Environment, description?: string) => {
    if (environment.environmentType !== 'DEV') return
    
    // 색인 확인 alert
    const isConfirmed = window.confirm(
      '색인을 시작하시겠습니까?'
    )
    
    if (!isConfirmed) {
      logger.info('색인 취소됨')
      return
    }
    
    setIsIndexing(true)
    setIndexingProgress(0)
    setIndexingMessage('색인 시작 중...')
    try {
      const response = await deploymentService.executeIndexing({ description })
      if (response.taskId) {
        logger.info('색인 시작', { taskId: response.taskId, message: response.message })
        toast({
          title: "색인 시작",
          description: "색인이 시작되었습니다. 진행 상황을 모니터링합니다.",
          variant: "default"
        })
        // 즉시 환경 정보 새로고침
        await fetchEnvironments()
        // Task ID를 사용하여 모니터링 시작
        startIndexingMonitoring(response.taskId)
      } else {
        throw new Error('Task ID가 반환되지 않았습니다.')
      }
    } catch (error) {
      logger.error('색인 요청 실패', error as Error)
      toast({
          title: "네트워크 오류",
          description: "색인 요청 중 오류가 발생했습니다. 다시 시도해주세요.",
          variant: "destructive"
        })
      setIsIndexing(false)
      setIndexingProgress(0)
      setIndexingMessage('')
    }
  }

  // 배포 실행
  const handleDeploy = async (description?: string) => {
    // 배포 확인 alert
    const isConfirmed = window.confirm(
      '운영 환경으로 배포하시겠습니까?'
    )
    
    if (!isConfirmed) {
      logger.info('배포 취소됨')
      return
    }
    
    setIsDeploying(true)
    try {
      const response = await deploymentService.executeDeploy({ description })
      if (response.success) {
        logger.info('배포 완료', { message: response.message })
        toast({
          title: "배포 완료",
          description: `운영 환경으로 배포가 완료되었습니다.`,
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
          indexingProgress={indexingProgress}
          indexingMessage={indexingMessage}
          isDeploying={isDeploying}
        />

        {/* 색인/배포 이력 */}
        <DeploymentHistory history={deployHistory} />
      </div>
    </div>
  )
} 