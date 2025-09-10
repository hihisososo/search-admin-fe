// Task 상태
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'

// Task 타입
export type TaskType = 
  | 'INDEXING'
  | 'QUERY_GENERATION'
  | 'CANDIDATE_GENERATION'
  | 'LLM_EVALUATION'
  | 'EVALUATION_EXECUTION'

// Task 정보
export interface Task {
  id: number
  taskType: TaskType
  status: TaskStatus
  progress: number
  message: string
  errorMessage?: string | null
  result?: string | null
  createdAt: string
  startedAt?: string | null
  completedAt?: string | null
}

// 색인 작업 응답
export interface IndexingResponse {
  taskId: number
  message: string
}

// 색인 결과
export interface IndexingResult {
  version: string
  documentCount: number
  indexName: string
}

// Task 목록 응답
export interface TaskListResponse {
  tasks: Task[]
  totalCount: number
  totalPages: number
  currentPage: number
  size: number
}