import type { PageResponse, SearchParams, Environment } from '../common/types'

// 사전 아이템 기본 인터페이스
export interface DictionaryItem {
  id: number
  keyword: string
  description?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  environment: Environment
  isActive: boolean
  usageCount: number
  lastUsedAt: string | null
  isNew?: boolean
  isEditing?: boolean
}

// 오타교정 사전 아이템
export interface TypoCorrectionDictionaryItem extends DictionaryItem {
  typoWord: string
  correctWord: string
  typoType: 'SPELLING' | 'KEYBOARD' | 'PHONETIC' | 'SPACING'
  autoDetected: boolean
  confidence: number
  correctionCount: number
  lastCorrectedAt: string | null
  editDistance: number
  detectionMethod: string
  // 호환성을 위해 correctedWord 유지
  correctedWord?: string
}

// 동의어 사전 아이템
export interface SynonymDictionaryItem extends DictionaryItem {
  synonymType: 'BIDIRECTIONAL' | 'UNIDIRECTIONAL'
  synonymCount: number
  expandedTerms: string[]
}

// 불용어 사전 아이템  
export type StopwordDictionaryItem = DictionaryItem

// 사용자 사전 아이템
export interface UserDictionaryItem extends DictionaryItem {
  pos: string
  category: string
  priority: number
  synonyms: string[]
  relatedWords: string[]
  tokenInfo: {
    originalTokens: string[]
    userDefinedToken: string
    tokenLength: number
  }
}

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
export interface CreateTypoCorrectionRequest {
  keyword: string // "오타 => 정답" 형식
  description?: string
  typoType?: 'SPELLING' | 'KEYBOARD' | 'PHONETIC' | 'SPACING'
  confidence?: number
  isActive?: boolean
  applyRules?: {
    caseSensitive?: boolean
    applyToCompounds?: boolean
    minWordLength?: number
  }
  testQueries?: string[]
}

// 사전 업데이트 요청
export interface UpdateDictionaryRequest {
  keyword: string
  description?: string
}

// 오타교정 사전 업데이트 요청
export interface UpdateTypoCorrectionRequest {
  keyword: string // "오타 => 정답" 형식
  description?: string
  typoType?: 'SPELLING' | 'KEYBOARD' | 'PHONETIC' | 'SPACING'
  confidence?: number
  isActive?: boolean
  applyRules?: {
    caseSensitive?: boolean
    applyToCompounds?: boolean
    minWordLength?: number
  }
}

// 실시간 동기화 응답
export interface RealtimeSyncResponse {
  status: 'SUCCESS' | 'FAILED'
  message: string
  timestamp: string
  syncDetails: {
    environment: Environment
    syncedCount: number
    addedCount: number
    updatedCount: number
    deletedCount: number
    failedCount: number
    duration: string
  }
  validation?: {
    totalChecked: number
    validCount: number
    invalidCount: number
    warnings: string[]
  }
}

// 동기화 상태 응답
export interface SyncStatusResponse {
  environments: {
    [key: string]: {
      status: string
      lastSyncTime: string
      lastSyncBy: string
      totalSynonyms?: number
      totalCorrections?: number
      pendingChanges: number
      nextScheduledSync: string | null
    }
  }
  syncHistory?: Array<{
    syncId: string
    environment: string
    syncTime: string
    syncBy: string
    syncType: string
    result: string
    changes: {
      added: number
      updated: number
      deleted: number
    }
  }>
  systemStatus?: {
    autoSyncEnabled: boolean
    syncInterval: string
    lastHealthCheck: string
    healthStatus: string
  }
}

// 정렬 필드 타입
export type DictionarySortField = 'keyword' | 'createdAt' | 'updatedAt'
export type DictionarySortDirection = 'asc' | 'desc' 