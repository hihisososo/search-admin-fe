import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Search, PieChart } from "lucide-react";
import * as React from "react";
import type { StatItem, DashboardStats, PopularKeywordsResponse, TrendsResponse, IndexDistributionResponse, KeywordItem, TrendDataPoint } from "@/types/dashboard";
import type { DateRange } from "react-day-picker";
import { dashboardApi } from "@/lib/api";

import DashboardHeader from "./components/DashboardHeader";
import StatsCards from "./components/StatsCards";
import AnalyticsCharts from "./components/AnalyticsCharts";
import KeywordsTable from "./components/KeywordsTable";
import DistributionChart from "./components/DistributionChart";

interface ResponseTimeData {
  date: string;
  responseTime: number;
}

interface SearchVolumeData {
  date: string;
  searches: number;
  successfulSearches: number;
  failedSearches: number;
}

interface TopKeyword {
  keyword: string;
  searches: number;
  ctr: string;
  trend: 'up' | 'down' | 'stable';
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function DashboardPage() {
  // 오늘~6일전
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 6);
  
  // 상태들
  const [selectedIndex, setSelectedIndex] = React.useState<string>("전체");
  const [dateRange, setDateRange] = React.useState<DateRange>({ from: start, to: today });
  const [loading, setLoading] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState(new Date());

  // API 응답 데이터 상태
  const [stats, setStats] = React.useState<StatItem[]>([]);
  const [popularKeywords, setPopularKeywords] = React.useState<KeywordItem[]>([]);
  const [trendingKeywords, setTrendingKeywords] = React.useState<KeywordItem[]>([]);
  const [responseTimeData, setResponseTimeData] = React.useState<ResponseTimeData[]>([]);
  const [searchVolumeData, setSearchVolumeData] = React.useState<SearchVolumeData[]>([]);
  const [indexDistribution, setIndexDistribution] = React.useState<any[]>([]);

  // 날짜를 ISO 문자열로 변환하는 함수
  const formatDateForApi = (date: Date): string => {
    return date.toISOString().replace('Z', '');
  };

  // API 파라미터 생성
  const getApiParams = () => {
    const params: any = {};
    
    if (selectedIndex !== "전체") {
      params.indexName = selectedIndex;
    }
    
    if (dateRange.from) {
      params.from = formatDateForApi(dateRange.from);
    }
    
    if (dateRange.to) {
      params.to = formatDateForApi(dateRange.to);
    }
    
    return params;
  };

  // 통계 데이터를 StatItem 배열로 변환
  const convertStatsToStatItems = (dashboardStats: DashboardStats): StatItem[] => {
    return [
      { label: "검색량", value: dashboardStats.totalSearchCount.toLocaleString() },
      { label: "문서량", value: dashboardStats.totalDocumentCount.toLocaleString() },
      { label: "검색실패", value: `${dashboardStats.searchFailureRate}%` },
      { label: "에러건수", value: dashboardStats.errorCount },
      { label: "평균응답시간", value: `${Math.round(dashboardStats.averageResponseTimeMs)}ms` },
      { label: "성공률", value: `${dashboardStats.successRate}%` },
    ];
  };

  // 트렌드 데이터를 차트 형식으로 변환
  const convertTrendsToChartData = (trendsData: TrendsResponse) => {
    const responseTimeData = trendsData.responseTimeData.map(item => ({
      date: item.label,
      responseTime: item.averageResponseTime
    }));

    const searchVolumeData = trendsData.searchVolumeData.map(item => ({
      date: item.label,
      searches: item.searchCount,
      successfulSearches: Math.round(item.searchCount * 0.98), // 성공률 98% 가정
      failedSearches: Math.round(item.searchCount * 0.02)
    }));

    return { responseTimeData, searchVolumeData };
  };

  // 인덱스 분포를 차트 형식으로 변환
  const convertIndexDistributionToChartData = (distributionData: IndexDistributionResponse) => {
    return distributionData.indices.map((item, index) => ({
      name: item.indexName,
      value: item.percentage,
      color: COLORS[index % COLORS.length]
    }));
  };

  // 키워드를 테이블 형식으로 변환
  const convertKeywordsToTableData = (keywords: KeywordItem[]): TopKeyword[] => {
    return keywords.map(item => ({
      keyword: item.keyword,
      searches: item.count,
      ctr: `${item.percentage}%`,
      trend: 'stable' as const // API에서 트렌드 정보가 없으므로 기본값
    }));
  };

  // 데이터 로드 함수
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const params = getApiParams();

      // 모든 API 병렬 호출
      const [
        statsResponse,
        popularKeywordsResponse,
        trendingKeywordsResponse,
        trendsResponse,
        distributionResponse
      ] = await Promise.all([
        dashboardApi.getStats(params),
        dashboardApi.getPopularKeywords({ ...params, limit: 10 }),
        dashboardApi.getTrendingKeywords({ ...params, limit: 5 }),
        dashboardApi.getTrends({ ...params, interval: 'day' }),
        dashboardApi.getIndexDistribution(params)
      ]);

      // 데이터 변환 및 상태 업데이트
      setStats(convertStatsToStatItems(statsResponse));
      setPopularKeywords(popularKeywordsResponse.keywords);
      setTrendingKeywords(trendingKeywordsResponse.keywords);
      
      const { responseTimeData, searchVolumeData } = convertTrendsToChartData(trendsResponse);
      setResponseTimeData(responseTimeData);
      setSearchVolumeData(searchVolumeData);
      
      setIndexDistribution(convertIndexDistributionToChartData(distributionResponse));
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      // 에러 발생시 빈 데이터로 초기화
      setStats([]);
      setPopularKeywords([]);
      setTrendingKeywords([]);
      setResponseTimeData([]);
      setSearchVolumeData([]);
      setIndexDistribution([]);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트시 및 필터 변경시 데이터 로드
  React.useEffect(() => {
    loadDashboardData();
  }, [selectedIndex, dateRange]);

  const handleRefresh = () => {
    loadDashboardData();
  };

  // 키워드 테이블용 데이터 (인기 + 급등 키워드 합친 것)
  const topKeywords = React.useMemo(() => {
    const popular = convertKeywordsToTableData(popularKeywords);
    const trending = convertKeywordsToTableData(trendingKeywords).map(item => ({
      ...item,
      trend: 'up' as const
    }));
    
    // 중복 제거하고 합치기
    const combined = [...popular];
    trending.forEach(trendingItem => {
      if (!popular.find(p => p.keyword === trendingItem.keyword)) {
        combined.push(trendingItem);
      }
    });
    
    return combined.slice(0, 10); // 상위 10개만
  }, [popularKeywords, trendingKeywords]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 섹션 */}
        <DashboardHeader
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onRefresh={handleRefresh}
          loading={loading}
          lastUpdated={lastUpdated}
        />
        
        {/* 통계 카드 그리드 */}
        <StatsCards stats={stats} loading={loading} />
        
        {/* 탭 기반 컨텐츠 */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-fit lg:grid-cols-3">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              분석
            </TabsTrigger>
            <TabsTrigger value="keywords" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              키워드
            </TabsTrigger>
            <TabsTrigger value="distribution" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              분포
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsCharts
              responseTimeData={responseTimeData}
              searchVolumeData={searchVolumeData}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="keywords" className="space-y-6">
            <KeywordsTable keywords={topKeywords} loading={loading} />
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <DistributionChart data={indexDistribution} loading={loading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 