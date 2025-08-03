import type { PageResponse, SearchParams, Environment } from '../common/types'

// 사전 아이템 기본 인터페이스
export interface DictionaryItem {
  id: number
  keyword: string
  description?: string
  createdAt: string
  updatedAt: string
  isNew?: boolean
  isEditing?: boolean
}

// 오타교정 사전 아이템
export interface TypoCorrectionDictionaryItem extends DictionaryItem {
  correctedWord: string
}

// 동의어 사전 아이템
export interface SynonymDictionaryItem extends DictionaryItem {}

// 불용어 사전 아이템  
export interface StopwordDictionaryItem extends DictionaryItem {}

// 사용자 사전 아이템
export interface UserDictionaryItem extends DictionaryItem {}

// 사전 페이지 응답
export type DictionaryPageResponse<T> = PageResponse<T>

// 사전 검색 파라미터
export interface DictionarySearchParams extends SearchParams {
  environment?: Environment
  sortBy?: 'keyword' | 'createdAt' | 'updatedAt'
  sortDir?: 'asc' | 'desc'
  [key: string]: string | number | boolean | undefined
}

// 사전 생성 요청
export interface CreateDictionaryRequest {
  keyword: string
  description?: string
}

// 오타교정 사전 생성 요청
export interface CreateTypoCorrectionRequest extends CreateDictionaryRequest {
  correctedWord: string
}

// 사전 업데이트 요청
export interface UpdateDictionaryRequest {
  keyword: string
  description?: string
}

// 오타교정 사전 업데이트 요청
export interface UpdateTypoCorrectionRequest extends UpdateDictionaryRequest {
  correctedWord: string
}

// 실시간 동기화 응답
export interface RealtimeSyncResponse {
  success: boolean
  message: string
  environment: string
  timestamp: number
}

// 동기화 상태 응답
export interface SyncStatusResponse {
  success: boolean
  typoCorrectionStatus: string
  lastSyncTime: number
  timestamp: number
}

// 정렬 필드 타입
export type DictionarySortField = 'keyword' | 'createdAt' | 'updatedAt'
export type DictionarySortDirection = 'asc' | 'desc' 