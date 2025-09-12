import type { AsyncTaskStatus } from '@/services/evaluation/types'
import type { Task } from '@/services/task/types'

// Task와 AsyncTaskStatus의 호환성을 위한 타입
type TaskLike = AsyncTaskStatus | Task

/**
 * 날짜 포맷팅 (한국어)
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('ko-KR')
}

/**
 * 성능 점수에 따른 색상 클래스 반환
 */
export function getPerformanceColor(score: number): string {
  if (score >= 0.8) return "text-green-600"
  if (score >= 0.6) return "text-yellow-600" 
  return "text-red-600"
}

/**
 * 비동기 작업 진행률 표시 텍스트 생성
 */
export function getTaskProgressText(
  taskStatus: TaskLike | undefined,
  defaultText: string,
  _startingText: string = '시작중...'
): string {
  if (!taskStatus) return defaultText
  
  const progress = taskStatus.progress || 0
  let countInfo = ''
  
  try {
    if (taskStatus.result) {
      const result = JSON.parse(taskStatus.result)
      
      // 다양한 진행률 표시 형식 지원
      if (result.currentIndex && result.totalCount) {
        countInfo = ` (${result.currentIndex}/${result.totalCount})`
      } else if (result.processedCount && result.totalCount) {
        countInfo = ` (${result.processedCount}/${result.totalCount})`
      } else if (result.evaluatedCount && result.totalCount) {
        countInfo = ` (${result.evaluatedCount}/${result.totalCount})`
      } else if (result.generatedCount && (result.targetCount || result.requestedCount)) {
        const total = result.targetCount ?? result.requestedCount
        countInfo = ` (${result.generatedCount}/${total})`
      }
    }
  } catch {
    // JSON 파싱 실패 시 무시
  }
  
  return `진행중 ${progress}%${countInfo}`
}

/**
 * 작업 완료 알림 메시지 생성
 */
export function getTaskCompletionMessage(
  taskType: 'QUERY_GENERATION' | 'CANDIDATE_GENERATION' | 'LLM_EVALUATION' | 'EVALUATION_EXECUTION' | 'INDEXING',
  result?: string | null
): string {
  const baseMessages: Record<string, string> = {
    QUERY_GENERATION: '쿼리 생성 완료!',
    CANDIDATE_GENERATION: '후보군 생성 완료!',
    LLM_EVALUATION: 'LLM 평가 완료!',
    EVALUATION_EXECUTION: '평가 실행 완료!',
    INDEXING: '색인 완료!'
  }

  let message = baseMessages[taskType] || '작업 완료!'

  if (result && taskType === 'QUERY_GENERATION') {
    try {
      const parsed = JSON.parse(result)
      if (parsed.generatedCount) {
        message += `\n생성된 쿼리: ${parsed.generatedCount}개`
      }
    } catch {
      // JSON 파싱 실패 시 기본 메시지 사용
    }
  }

  return message
}

/**
 * 페이지네이션 범위 계산
 */
export function calculatePaginationRange(
  currentPage: number, 
  totalPages: number, 
  maxVisible: number = 5
): { startPage: number; endPage: number } {
  let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2))
  const endPage = Math.min(totalPages - 1, startPage + maxVisible - 1)
  
  // 끝에서 역산하여 시작 페이지 조정
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(0, endPage - maxVisible + 1)
  }

  return { startPage, endPage }
}

/**
 * 선택된 항목 수에 따른 상태 계산
 */
export function calculateSelectionState(
  items: Array<{ id: number }>,
  selectedIds: number[]
): {
  selectedInCurrentPage: number[]
  isAllSelected: boolean
  isIndeterminate: boolean
} {
  const currentPageIds = items.map(item => item.id)
  const selectedInCurrentPage = currentPageIds.filter(id => selectedIds.includes(id))
  const isAllSelected = items.length > 0 && selectedInCurrentPage.length === items.length
  const isIndeterminate = selectedInCurrentPage.length > 0 && selectedInCurrentPage.length < items.length

  return {
    selectedInCurrentPage,
    isAllSelected,
    isIndeterminate
  }
}

/**
 * 평가 결과 상세 데이터 파싱
 */
export function parseEvaluationDetails(detailedResults: string): {
  success: boolean
  queryDetails?: any[]
  error?: string
} {
  try {
    const details = JSON.parse(detailedResults)
    const queryDetails = Array.isArray(details) ? details : details.queryDetails
    
    if (queryDetails && Array.isArray(queryDetails) && queryDetails.length > 0) {
      return { success: true, queryDetails }
    } else {
      return { 
        success: false, 
        error: '쿼리별 상세 결과 데이터가 없거나 형식이 올바르지 않습니다.' 
      }
    }
  } catch (_e) {
    return { 
      success: false, 
      error: '상세 결과 데이터를 해석할 수 없습니다. 백엔드 데이터 형식을 확인해주세요.' 
    }
  }
} 