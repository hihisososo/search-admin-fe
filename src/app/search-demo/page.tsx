import * as React from "react";
import { dashboardApi, enhancedSearchApi, type Product, type AggregationBucket } from "@/lib/api";
// import { type KeywordItem } from "@/types/dashboard";
// import { logger } from "@/lib/logger";
import { SearchHeader } from "./components/SearchHeader";
import { PopularKeywords } from "./components/PopularKeywords";
import { TrendingKeywords } from "./components/TrendingKeywords";
import { ProductFilters } from "./components/ProductFilters";
import { ProductList } from "./components/ProductList";
import { CategorySidebar } from "./components/CategorySidebar";

export default function SearchDemo() {
  // 검색/필터 상태
  const [query, setQuery] = React.useState("노트북"); // 입력창 값
  const [searchQuery, setSearchQuery] = React.useState("노트북"); // 실제 검색 실행 값
  const [brand, setBrand] = React.useState<string[]>([]);
  const [category, setCategory] = React.useState<string[]>([]);
  const [price, setPrice] = React.useState<{ from: string; to: string }>({ from: "", to: "" });
  const [page, setPage] = React.useState(0);
  const pageSize = 10;
  const [sort, setSort] = React.useState("score");
  const [categorySub, setCategorySub] = React.useState<string[]>([]);
  // const [applyTypoCorrection, setApplyTypoCorrection] = React.useState(true); // 오타교정 - 백엔드 미지원
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [_brandAgg, setBrandAgg] = React.useState<AggregationBucket[]>([]);
  const [_categoryAgg, setCategoryAgg] = React.useState<AggregationBucket[]>([]);
  const [baseBrandAgg, setBaseBrandAgg] = React.useState<AggregationBucket[]>([]); // 최초 검색 시 aggregation 저장
  const [baseCategoryAgg, setBaseCategoryAgg] = React.useState<AggregationBucket[]>([]); // 최초 검색 시 aggregation 저장
  const [totalResults, setTotalResults] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [popularKeywords, setPopularKeywords] = React.useState<Array<{ 
    keyword: string, 
    searchCount: number, 
    rank: number, 
    previousRank: number | null, 
    rankChange: number | null, 
    changeStatus: "UP" | "DOWN" | "NEW" | "SAME" 
  }>>([]);
  const [trendingKeywords, setTrendingKeywords] = React.useState<Array<{ 
    keyword: string, 
    searchCount: number, 
    rank: number, 
    previousRank: number | null, 
    rankChange: number | null, 
    changeStatus: "UP" | "DOWN" | "NEW" | "SAME" 
  }>>([]);
  const [_relatedKeywords, _setRelatedKeywords] = React.useState<string[]>([]);
  const [_hasSearched, setHasSearched] = React.useState(false); // 검색 실행 여부 추적
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null); // 선택된 카테고리

  // 최소 로딩 시간을 보장하는 헬퍼 함수
  const ensureMinimumLoadingTime = React.useCallback(async <T,>(apiCall: Promise<T>, minTime: number = 500): Promise<T> => {
    const startTime = Date.now();
    
    const result = await apiCall;
    const elapsedTime = Date.now() - startTime;
    
    if (elapsedTime < minTime) {
      // 최소 시간이 되지 않았으면 추가 대기
      await new Promise(resolve => setTimeout(resolve, minTime - elapsedTime));
    }
    
    return result;
  }, []);

  // 초기 검색 실행 (새 검색어로 검색 시 - aggregation 업데이트)
  const performInitialSearch = React.useCallback(async () => {
    if (!searchQuery) {
      setProducts([]);
      setTotalResults(0);
      setTotalPages(0);
      setBrandAgg([]);
      setCategoryAgg([]);
      setBaseBrandAgg([]);
      setBaseCategoryAgg([]);
      return;
    }

    setHasSearched(true);
    setLoading(true);
    
    // 필터 초기화
    setBrand([]);
    setCategory([]);
    setCategorySub([]);
    setPrice({ from: "", to: "" });
    
    try {
      const searchRequest = {
        query: searchQuery,
        page: 0,
        size: pageSize,
        // applyTypoCorrection 파라미터는 백엔드에서 지원하지 않음
      };

      const response = await ensureMinimumLoadingTime(
        enhancedSearchApi.executeSearch(searchRequest), 
        500 // 0.5초 최소 로딩
      );

      // API 응답을 Product 타입에 맞게 변환
      const transformedProducts = response.hits.data.map((item) => ({
        ...item,
        id: item.id || String(Math.floor(Math.random() * 1000000)),
        categoryName: item.categoryName || '',
        specsRaw: item.specsRaw || '',
        specs: item.specs || ''
      }));

      setProducts(transformedProducts);
      setTotalResults(response.hits.total);
      setTotalPages(response.meta.totalPages);
      setPage(0);

      // 최초 검색 시 aggregation 저장 (그룹 필터용)
      if (response.aggregations?.brand_name) {
        setBrandAgg(response.aggregations.brand_name);
        setBaseBrandAgg(response.aggregations.brand_name);
      }
      if (response.aggregations?.category_name) {
        setCategoryAgg(response.aggregations.category_name);
        setBaseCategoryAgg(response.aggregations.category_name);
      }

    } catch (error) {
      console.error('검색 오류:', error);
      setProducts([]);
      setTotalResults(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, pageSize, ensureMinimumLoadingTime]);

  // 필터 검색 실행 (필터 변경 시 - 상품 리스트만 업데이트)
  const performFilterSearch = React.useCallback(async () => {
    if (!searchQuery && brand.length === 0 && category.length === 0 && categorySub.length === 0 && !price.from && !price.to) {
      return;
    }

    setLoading(true);
    try {
      // 정렬 필드와 순서 결정
      let sortField: string = 'score';
      let sortOrder: 'asc' | 'desc' = 'desc';

      if (sort === 'price_asc') {
        sortField = 'price';
        sortOrder = 'asc';
      } else if (sort === 'price_desc') {
        sortField = 'price';
        sortOrder = 'desc';
      } else if (sort === 'reviewCount') {
        sortField = 'reviewCount';
        sortOrder = 'desc';
      } else if (sort === 'registeredMonth') {
        sortField = 'registeredMonth';
        sortOrder = 'desc';
      }

      const searchRequest = {
        query: searchQuery || "",
        page: page,
        size: pageSize,
        sortField: sortField,
        sortOrder: sortOrder,
        // applyTypoCorrection 파라미터는 백엔드에서 지원하지 않음
        ...(brand.length > 0 && { brand }),
        ...(category.length > 0 && { category }),
        ...(price.from && { priceFrom: Number(price.from) }),
        ...(price.to && { priceTo: Number(price.to) })
      };

      const response = await ensureMinimumLoadingTime(
        enhancedSearchApi.executeSearch(searchRequest), 
        600 // 필터링은 조금 더 빠르게
      );

      // API 응답을 Product 타입에 맞게 변환
      const transformedProducts = response.hits.data.map((item) => ({
        ...item,
        id: item.id || String(Math.floor(Math.random() * 1000000)),
        categoryName: item.categoryName || '',
        specsRaw: item.specsRaw || '',
        specs: item.specs || ''
      }));

      setProducts(transformedProducts);
      setTotalResults(response.hits.total);
      setTotalPages(response.meta.totalPages);

      // 그룹 필터: aggregation은 최초 검색 결과 유지 (업데이트하지 않음)
      // 필터 옵션은 baseBrandAgg, baseCategoryAgg를 사용

    } catch (error) {
      console.error('검색 오류:', error);
      setProducts([]);
      setTotalResults(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, page, pageSize, sort, brand, category, categorySub, price, ensureMinimumLoadingTime]);

  // 어제 날짜 범위를 계산하는 함수 (대시보드와 동일 포맷: 로컬 기준 YYYY-MM-DDTHH:mm:ss)
  const getYesterdayDateRange = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const y = yesterday.getFullYear();
    const m = String(yesterday.getMonth() + 1).padStart(2, '0');
    const d = String(yesterday.getDate()).padStart(2, '0');

    // 오늘 날짜로 설정 (어제 끝 = 오늘 시작)
    const ty = today.getFullYear();
    const tm = String(today.getMonth() + 1).padStart(2, '0');
    const td = String(today.getDate()).padStart(2, '0');

    return {
      from: `${y}-${m}-${d}T00:00:00`,
      to: `${ty}-${tm}-${td}T00:00:00`
    };
  };

  // 인기/급등 검색어 로드
  React.useEffect(() => {
    const loadKeywords = async () => {
      try {
        const { from, to } = getYesterdayDateRange();

        // 데모 페이지: 어제 하루치 기준으로 조회 (대시보드와 동일 파라미터 구성)
        const commonParams = { from, to, limit: 10 };
        const [popularResponse, trendingResponse] = await Promise.all([
          dashboardApi.getPopularKeywords(commonParams),
          dashboardApi.getTrendingKeywords(commonParams)
        ]);

        // 인기 검색어 정렬/상위 10개 제한 + 표시용 순번 보정
        const sortedPopular = [...popularResponse.keywords].sort((a: any, b: any) => {
          const ra = a.rank ?? Number.MAX_SAFE_INTEGER
          const rb = b.rank ?? Number.MAX_SAFE_INTEGER
          if (ra !== rb) return ra - rb
          const ca = (a as any).searchCount ?? a.count ?? 0
          const cb = (b as any).searchCount ?? b.count ?? 0
          return cb - ca
        }).slice(0, 10)

        setPopularKeywords(sortedPopular.map((k: any, idx: number) => ({
          keyword: k.keyword,
          searchCount: (k as any).searchCount ?? k.count ?? 0,
          rank: idx + 1,
          previousRank: (k as any).previousRank ?? null,
          rankChange: (k as any).rankChange ?? null,
          changeStatus: (k as any).changeStatus ?? "SAME"
        })));

        // 급등 검색어 정렬/상위 10개 제한 + 표시용 순번 보정
        const sortedTrending = [...trendingResponse.keywords].sort((a: any, b: any) => {
          const ra = a.rank ?? Number.MAX_SAFE_INTEGER
          const rb = b.rank ?? Number.MAX_SAFE_INTEGER
          if (ra !== rb) return ra - rb
          const ca = a.searchCount ?? a.count ?? 0
          const cb = b.searchCount ?? b.count ?? 0
          return cb - ca
        }).slice(0, 10)

        setTrendingKeywords(sortedTrending.map((k: any, idx: number) => ({
          keyword: k.keyword,
          searchCount: k.searchCount ?? k.count ?? 0,
          // UI 표시는 1~10로 보정
          rank: idx + 1,
          previousRank: k.previousRank ?? null,
          rankChange: k.rankChange ?? null,
          changeStatus: k.changeStatus ?? (k.rankChange && k.rankChange > 0 ? "UP" : k.rankChange && k.rankChange < 0 ? "DOWN" : "SAME")
        })));

      } catch (error) {
        console.error('검색어 로드 오류:', error);
      }
    };

    loadKeywords();
  }, []);

  // 새 검색어로 검색 시 (초기 검색)
  React.useEffect(() => {
    if (searchQuery) {
      performInitialSearch();
    }
  }, [searchQuery, performInitialSearch]);

  // 필터 변경 시 (필터 검색)
  React.useEffect(() => {
    if (searchQuery) { // 검색어가 있을 때만 필터 적용
      performFilterSearch();
    }
  }, [brand, category, categorySub, page, sort, performFilterSearch]);

  // 카테고리 선택 시 (카테고리 네비게이션)
  React.useEffect(() => {
    if (selectedCategory) {
      // 카테고리가 선택되면 해당 카테고리 상품만 표시
      // 백엔드 API가 준비되면 여기에 카테고리 필터링 로직 추가
      console.log('Selected category:', selectedCategory);
      // TODO: 백엔드 API 연동 시 카테고리 필터 적용
    }
  }, [selectedCategory]);

  // 핸들러
  const handleSearch = React.useCallback((val: string) => {
    setSearchQuery(val);
    setQuery(val); // 검색창에도 반영
  }, []);

  // 필터 초기화
  const resetFilters = () => {
    setBrand([]);
    setCategory([]);
    setCategorySub([]);
    setPrice({ from: "", to: "" });
    setSelectedCategory(null);
    setPage(0);
  };

  // 정렬 변경 핸들러
  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(0);
  };

  // 가격 검색 핸들러 - 가격 버튼을 눌렀을 때만 검색 실행
  const handlePriceSearch = () => {
    setPage(0);
    if (searchQuery) {
      performFilterSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* 검색 헤더 */}
      <div className="w-full bg-white border-b">
        <div className="max-w-[1400px] mx-auto">
          <SearchHeader
            query={query}
            setQuery={setQuery}
            onSearch={handleSearch}
            relatedKeywords={[]}
            // 오타교정 props 제거 - 백엔드 미지원
          />
        </div>
      </div>

      {/* 메인 콘텐츠: 카테고리 + 콘텐츠 영역 */}
      <div className="flex" style={{ height: 'calc(100vh - 80px)' }}>
        {/* 왼쪽: 카테고리 사이드바 */}
        <CategorySidebar
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        {/* 오른쪽: 기존 콘텐츠 영역 */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1150px] mx-auto p-4">
            <div className="grid grid-cols-10 gap-4">
              {/* 좌측: 필터 + 상품리스트 */}
              <div className="col-span-8 space-y-4">
                <ProductFilters
                  category={category}
                  setCategory={setCategory}
                  categorySub={categorySub}
                  setCategorySub={setCategorySub}
                  brand={brand}
                  setBrand={setBrand}
                  price={price}
                  setPrice={setPrice}
                  brandAgg={baseBrandAgg} // 그룹 필터: 최초 검색 결과 사용
                  categoryAgg={baseCategoryAgg} // 그룹 필터: 최초 검색 결과 사용
                  onResetFilters={resetFilters}
                  onPriceSearch={handlePriceSearch}
                />

                <ProductList
                  products={products}
                  loading={loading}
                  totalResults={totalResults}
                  totalPages={totalPages}
                  page={page}
                  setPage={setPage}
                  sort={sort}
                  onSortChange={handleSortChange}
                  searchQuery={searchQuery}
                />
              </div>

              {/* 우측: 인기/급등 검색어 */}
              <div className="col-span-2 flex flex-col">
                <PopularKeywords
                  keywords={popularKeywords}
                  onKeywordClick={handleSearch}
                />
                <TrendingKeywords
                  keywords={trendingKeywords}
                  onKeywordClick={handleSearch}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 