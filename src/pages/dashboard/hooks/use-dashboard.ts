import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services'
import { queryKeys } from '@/lib/query-client'
import type { DashboardApiParams } from '@/services'

// 대시보드 통계 조회
export function useDashboardStats(params: DashboardApiParams = {}) {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(params),
    queryFn: () => dashboardService.getStats(params),
    enabled: true, // 항상 활성화
  })
}

// 인기 키워드 조회
export function usePopularKeywords(params: DashboardApiParams = {}) {
  return useQuery({
    queryKey: queryKeys.dashboard.popularKeywords(params),
    queryFn: () => dashboardService.getPopularKeywords(params),
    enabled: true,
  })
}

// 급등 키워드 조회
export function useTrendingKeywords(params: DashboardApiParams = {}) {
  return useQuery({
    queryKey: queryKeys.dashboard.trendingKeywords(params),
    queryFn: () => dashboardService.getTrendingKeywords(params),
    enabled: true,
  })
}

// 트렌드 조회
export function useTrends(params: DashboardApiParams = {}) {
  return useQuery({
    queryKey: queryKeys.dashboard.trends(params),
    queryFn: () => dashboardService.getTrends(params),
    enabled: true,
  })
}

// 모든 대시보드 데이터를 한번에 조회하는 훅
export function useDashboardData(params: DashboardApiParams = {}) {
  const statsQuery = useDashboardStats(params)
  const popularKeywordsQuery = usePopularKeywords({ ...params, limit: 10 })
  const trendingKeywordsQuery = useTrendingKeywords({ ...params, limit: 10 })
  const trendsQuery = useTrends({ ...params, interval: 'day' })

  return {
    stats: statsQuery,
    popularKeywords: popularKeywordsQuery,
    trendingKeywords: trendingKeywordsQuery,
    trends: trendsQuery,
    
    // 전체 로딩 상태 (초기 로딩 또는 refetch 중)
    isLoading: [
      statsQuery.isLoading || statsQuery.isFetching,
      popularKeywordsQuery.isLoading || popularKeywordsQuery.isFetching,
      trendingKeywordsQuery.isLoading || trendingKeywordsQuery.isFetching,
      trendsQuery.isLoading || trendsQuery.isFetching,
    ].some(Boolean),
    
    // 전체 에러 상태
    error: [
      statsQuery.error,
      popularKeywordsQuery.error,
      trendingKeywordsQuery.error,
      trendsQuery.error,
    ].find(Boolean),
    
    // 모든 데이터 로드 완료 여부
    isSuccess: [
      statsQuery.isSuccess,
      popularKeywordsQuery.isSuccess,
      trendingKeywordsQuery.isSuccess,
      trendsQuery.isSuccess,
    ].every(Boolean),
  }
} 