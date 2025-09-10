import { apiClient } from '../common/api-client'
import type { PageParams } from '../common/types'
import type { Task, TaskListResponse } from './types'

class TaskService {
  private readonly baseEndpoint = '/v1/tasks'

  // 작업 상태 조회
  async getTask(taskId: number): Promise<Task> {
    return apiClient.get<Task>(`${this.baseEndpoint}/${taskId}`)
  }

  // 실행중인 작업 목록 조회
  async getRunningTasks(): Promise<Task[]> {
    return apiClient.get<Task[]>(`${this.baseEndpoint}/running`)
  }

  // 작업 목록 조회
  async getTasks(params: PageParams = {}): Promise<TaskListResponse> {
    return apiClient.get<TaskListResponse>(this.baseEndpoint, params as Record<string, string | number | boolean | string[] | undefined>)
  }
}

export const taskService = new TaskService()