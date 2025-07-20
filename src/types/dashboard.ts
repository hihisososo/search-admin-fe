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