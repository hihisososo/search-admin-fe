import { useState, useEffect, useCallback } from 'react'
import type { Environment, DeployHistory } from '@/types/deploy'
import { deploymentService, taskService } from '@/services'
import { useToast } from '@/components/ui/use-toast'
import { logger } from '@/lib/logger'
import EnvironmentOverview from './components/EnvironmentOverview'
import DeploymentHistory from './components/DeploymentHistory'

const CONFIG = {
  INDEXING_TIMEOUT: 60 * 60 * 1000,
  POLLING_INTERVAL: 3000,
  INITIAL_PAGE_SIZE: 20
} as const

const MESSAGES = {
  indexing: {
    confirm: '색인을 시작하시겠습니까?',
    start: '색인이 시작되었습니다. 진행 상황을 모니터링합니다.',
    complete: '색인이 성공적으로 완료되었습니다.',
    failed: '색인이 실패했습니다. 다시 시도해주세요.'
  },
  deployment: {
    confirm: '운영 환경으로 배포하시겠습니까?',
    complete: '운영 환경으로 배포가 완료되었습니다.',
    failed: '배포가 실패했습니다.'
  }
} as const

const LoadingState = () => (
  <div className="p-5">
    <div className="max-w-7xl mx-auto text-center py-10">
      <div className="text-gray-500">로딩 중...</div>
    </div>
  </div>
)

export default function DeployManagement() {
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [deployHistory, setDeployHistory] = useState<DeployHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isIndexing, setIsIndexing] = useState(false)
  const [indexingProgress, setIndexingProgress] = useState<number>(0)
  const [indexingMessage, setIndexingMessage] = useState<string>('')
  const [isDeploying, setIsDeploying] = useState(false)
  const { toast } = useToast()

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

  const fetchDeploymentHistory = useCallback(async () => {
    try {
      const response = await deploymentService.getDeploymentHistory({
        page: 0,
        size: CONFIG.INITIAL_PAGE_SIZE,
        sort: 'createdAt,desc'
      })
      setDeployHistory(response.deploymentHistories)
    } catch (error) {
      logger.error('배포 이력 조회 실패', error as Error)
    }
  }, [])

  const handleTaskComplete = useCallback(async (task: any) => {
    await Promise.all([
      fetchEnvironments(),
      fetchDeploymentHistory()
    ])

    let documentCount = 0
    if (task.result) {
      try {
        const result = JSON.parse(task.result)
        documentCount = result.documentCount || 0
      } catch (e) {
        logger.error('색인 결과 파싱 실패', e as Error)
      }
    }

    const message = documentCount > 0
      ? `${MESSAGES.indexing.complete} (${new Intl.NumberFormat('ko-KR').format(documentCount)}개 문서)`
      : MESSAGES.indexing.complete

    toast({
      title: "색인 완료",
      description: message,
      variant: "default"
    })
  }, [fetchEnvironments, fetchDeploymentHistory, toast])

  const handleTaskFailed = useCallback(async (task: any) => {
    await fetchEnvironments()
    toast({
      title: "색인 실패",
      description: task.errorMessage || MESSAGES.indexing.failed,
      variant: "destructive"
    })
  }, [fetchEnvironments, toast])

  const checkTaskStatus = useCallback(async (taskId: number) => {
    try {
      const task = await taskService.getTask(taskId)

      if (task.status === 'IN_PROGRESS') {
        setIndexingProgress(task.progress || 0)
        setIndexingMessage(task.message || '색인 처리 중...')
        await fetchEnvironments()
        return false
      }

      if (task.status === 'COMPLETED') {
        await handleTaskComplete(task)
        return true
      }

      if (task.status === 'FAILED') {
        await handleTaskFailed(task)
        return true
      }

      return false
    } catch (error) {
      logger.error('Task 상태 확인 실패', error as Error)
      return true
    }
  }, [fetchEnvironments, handleTaskComplete, handleTaskFailed])

  const startIndexingMonitoring = useCallback((taskId: number) => {
    const interval = setInterval(async () => {
      const isCompleted = await checkTaskStatus(taskId)
      if (isCompleted) {
        clearInterval(interval)
        setIsIndexing(false)
        setIndexingProgress(0)
        setIndexingMessage('')
      }
    }, CONFIG.POLLING_INTERVAL)

    const timeoutId = setTimeout(() => {
      clearInterval(interval)
      setIsIndexing(false)
      setIndexingProgress(0)
      setIndexingMessage('')
    }, CONFIG.INDEXING_TIMEOUT)

    return () => {
      clearInterval(interval)
      clearTimeout(timeoutId)
    }
  }, [checkTaskStatus])

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      await fetchEnvironments()
      await fetchDeploymentHistory()

      try {
        const runningTasks = await taskService.getRunningTasks()
        const indexingTask = runningTasks.find(task => task.taskType === 'INDEXING')

        if (indexingTask) {
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
  }, [fetchEnvironments, fetchDeploymentHistory, startIndexingMonitoring])

  const handleReindex = async (environment: Environment, description?: string) => {
    if (environment.environmentType !== 'DEV') return

    if (!window.confirm(MESSAGES.indexing.confirm)) {
      return
    }

    setIsIndexing(true)
    setIndexingProgress(0)
    setIndexingMessage('색인 시작 중...')

    try {
      const response = await deploymentService.executeIndexing({ description })
      if (response.taskId) {
        toast({
          title: "색인 시작",
          description: MESSAGES.indexing.start,
          variant: "default"
        })
        await fetchEnvironments()
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

  const handleDeploy = async (description?: string) => {
    if (!window.confirm(MESSAGES.deployment.confirm)) {
      return
    }

    setIsDeploying(true)
    try {
      await deploymentService.executeDeploy({ description })
      // 200 OK 응답이면 성공으로 처리
      toast({
        title: "배포 완료",
        description: MESSAGES.deployment.complete,
        variant: "default"
      })
      await Promise.all([
        fetchEnvironments(),
        fetchDeploymentHistory()
      ])
    } catch (error) {
      logger.error('배포 요청 실패', error as Error)
      toast({
        title: "배포 실패",
        description: MESSAGES.deployment.failed,
        variant: "destructive"
      })
    } finally {
      setIsDeploying(false)
    }
  }

  if (isLoading) return <LoadingState />

  return (
    <div className="p-5 space-y-5">
      <div className="max-w-7xl mx-auto space-y-5">
        <EnvironmentOverview
          environments={environments}
          onDeploy={handleDeploy}
          onReindex={handleReindex}
          isIndexing={isIndexing}
          indexingProgress={indexingProgress}
          indexingMessage={indexingMessage}
          isDeploying={isDeploying}
        />
        <DeploymentHistory history={deployHistory} />
      </div>
    </div>
  )
}