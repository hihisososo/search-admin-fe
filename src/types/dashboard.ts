export interface StatItem {
  label: string;
  value: number | string;
}

export interface SearchRequest {
  date: string;
  count: number;
}

export interface KeywordCount {
  keyword: string;
  count: number;
}

// API 명세에 맞는 타입 정의
export interface DashboardStats {
  totalSearchCount: number;
  totalDocumentCount: number;
  searchFailureRate: number;
  errorCount: number;
  averageResponseTimeMs: number;
  successRate: number;
  period: string;
  indexName?: string;
}

export interface KeywordItem {
  keyword: string;
  searchCount: number;
  rank: number;
  previousRank: number | null;
  rankChange: number | null;
  changeStatus: "UP" | "DOWN" | "NEW" | "SAME";
}

export interface PopularKeywordsResponse {
  keywords: KeywordItem[];
  period: string;
  indexName?: string;
}

export interface TrendingKeywordsResponse {
  keywords: KeywordItem[];
  period: string;
  indexName?: string;
}

export interface TrendDataPoint {
  timestamp: string;
  searchCount: number;
  averageResponseTime: number;
  label: string;
}

export interface TrendsResponse {
  searchVolumeData: TrendDataPoint[];
  responseTimeData: TrendDataPoint[];
  period: string;
  indexName?: string;
  interval: string;
}

export interface IndexDistributionItem {
  indexName: string;
  searchCount: number;
  percentage: number;
  averageResponseTime: number;
  errorCount: number;
  successRate: number;
}

export interface IndexDistributionResponse {
  indices: IndexDistributionItem[];
  period: string;
  totalSearchCount: number;
}

// API 요청 파라미터 타입
export interface DashboardApiParams {
  indexName?: string;
  from?: string;
  to?: string;
  limit?: number;
  interval?: 'hour' | 'day';
}

// 🆕 새로 추가된 환경 타입
export const DictionaryEnvironmentType = {
  CURRENT: "CURRENT",  // 현재 편집 중인 사전
  DEV: "DEV",         // 개발 환경 사전  
  PROD: "PROD"        // 운영 환경 사전
} as const

export type DictionaryEnvironmentType = typeof DictionaryEnvironmentType[keyof typeof DictionaryEnvironmentType]

// 🆕 사전 공통 타입들
export interface DictionaryItem {
  id: number
  keyword: string
  correctedWord?: string  // 오타교정 사전용 교정어 필드
  description?: string
  createdAt: string
  updatedAt: string
  isNew?: boolean
  isEditing?: boolean
}

export interface DictionaryPageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export type DictionarySortField = 'keyword' | 'createdAt' | 'updatedAt'
export type DictionarySortDirection = 'asc' | 'desc'

// 환경별 표시 정보
export const ENVIRONMENT_LABELS: Record<DictionaryEnvironmentType, { label: string; color: string }> = {
  [DictionaryEnvironmentType.CURRENT]: {
    label: '현재 (편집용)',
    color: 'bg-blue-500'
  },
  [DictionaryEnvironmentType.DEV]: {
    label: '개발환경',
    color: 'bg-green-500'
  },
  [DictionaryEnvironmentType.PROD]: {
    label: '운영환경',
    color: 'bg-gray-800'
  }
} 