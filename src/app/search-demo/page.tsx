import * as React from "react";
import { dashboardApi, enhancedSearchApi, type Product, type AggregationBucket } from "@/lib/api";
// import { type KeywordItem } from "@/types/dashboard";
// import { logger } from "@/lib/logger";
import { SearchHeader } from "./components/SearchHeader";
import { PopularKeywords } from "./components/PopularKeywords";
import { TrendingKeywords } from "./components/TrendingKeywords";
import { ProductFilters } from "./components/ProductFilters";
import { ProductList } from "./components/ProductList";

export default function SearchDemo() {
  // 검색/필터 상태
  const [query, setQuery] = React.useState(""); // 입력창 값
  const [searchQuery, setSearchQuery] = React.useState(""); // 실제 검색 실행 값
  const isFirstRender = React.useRef(true); // 첫 렌더링 체크
  // const [searchTrigger, setSearchTrigger] = React.useState(0); // 검색 트리거 - 중복 검색 방지를 위해 제거
  const [brand, setBrand] = React.useState<string[]>([]);
  const [category, setCategory] = React.useState<string[]>([]);
  const [price, setPrice] = React.useState<{ from: string; to: string }>({ from: "", to: "" });
  const [appliedPrice, setAppliedPrice] = React.useState<{ from: string; to: string }>({ from: "", to: "" }); // 실제 적용된 가격
  const [page, setPage] = React.useState(0);
  const pageSize = 10;
  const [sort, setSort] = React.useState("score");
  const [categorySub, setCategorySub] = React.useState<string[]>([]);
  const [actualSearchType, setActualSearchType] = React.useState<'keyword' | 'vector' | null>(null); // 실제로 결과를 반환한 검색 타입
  const [rrfK, _setRrfK] = React.useState(60);
  const [hybridTopK, _setHybridTopK] = React.useState(300);
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
  const isInitialSearching = React.useRef(false); // 초기 검색 중인지 추적

  // 초기 검색 실행 (새 검색어로 검색 시 - aggregation 업데이트)
  const performInitialSearch = React.useCallback(async (newQuery: string) => {
    console.log('[초기 검색] 실행:', newQuery);
    
    isInitialSearching.current = true; // 초기 검색 시작
    setLoading(true);
    
    // 전체 검색 프로세스 시작 시간 기록
    const startTime = Date.now();
    const minLoadingTime = 500; // 최소 로딩 시간 0.5초
    
    try {
      // 1차: 키워드 검색 시도
      const keywordRequest = {
        query: newQuery,
        page: 0,
        size: pageSize,
        searchMode: "KEYWORD_ONLY" as const,
        rrfK,
        hybridTopK,
      };

      const keywordResponse = await enhancedSearchApi.executeSearch(keywordRequest);

      // 키워드 검색 결과가 있는지 확인
      if (keywordResponse.hits.total > 0) {
        // 키워드 검색 결과가 있으면 사용
        setActualSearchType('keyword');
        
        // API 응답을 Product 타입에 맞게 변환
        const transformedProducts = keywordResponse.hits.data.map((item) => ({
          ...item,
          id: item.id || String(Math.floor(Math.random() * 1000000)),
          categoryName: item.categoryName || '',
          specsRaw: item.specsRaw || '',
          specs: item.specs || ''
        }));

        setProducts(transformedProducts);
        setTotalResults(keywordResponse.hits.total);
        setTotalPages(keywordResponse.meta.totalPages);
        
        // aggregation 저장
        if (keywordResponse.aggregations?.brand_name) {
          setBrandAgg(keywordResponse.aggregations.brand_name);
          setBaseBrandAgg(keywordResponse.aggregations.brand_name);
        } else {
          setBrandAgg([]);
          setBaseBrandAgg([]);
        }
        
        if (keywordResponse.aggregations?.category_name) {
          setCategoryAgg(keywordResponse.aggregations.category_name);
          setBaseCategoryAgg(keywordResponse.aggregations.category_name);
        } else {
          setCategoryAgg([]);
          setBaseCategoryAgg([]);
        }
      } else {
        // 2차: 키워드 검색 결과가 없으면 벡터 검색 시도
        console.log('[벡터 검색] 키워드 검색 결과 없음, 벡터 검색 시도');
        
        const vectorRequest = {
          query: newQuery,
          page: 0,
          size: pageSize,
          searchMode: "VECTOR_MULTI_FIELD" as const,
          rrfK,
          hybridTopK,
          vectorMinScore: 0.7,
        };

        const vectorResponse = await enhancedSearchApi.executeSearch(vectorRequest);
        
        setActualSearchType('vector');
        
        // API 응답을 Product 타입에 맞게 변환
        const transformedProducts = vectorResponse.hits.data.map((item) => ({
          ...item,
          id: item.id || String(Math.floor(Math.random() * 1000000)),
          categoryName: item.categoryName || '',
          specsRaw: item.specsRaw || '',
          specs: item.specs || '',
          brand: item.brand || '' // 브랜드 필드 확실히 포함
        }));

        setProducts(transformedProducts);
        setTotalResults(vectorResponse.hits.total);
        setTotalPages(vectorResponse.meta.totalPages);
        
        // aggregation 저장
        if (vectorResponse.aggregations?.brand_name) {
          setBrandAgg(vectorResponse.aggregations.brand_name);
          setBaseBrandAgg(vectorResponse.aggregations.brand_name);
        } else {
          setBrandAgg([]);
          setBaseBrandAgg([]);
        }
        
        if (vectorResponse.aggregations?.category_name) {
          setCategoryAgg(vectorResponse.aggregations.category_name);
          setBaseCategoryAgg(vectorResponse.aggregations.category_name);
        } else {
          setCategoryAgg([]);
          setBaseCategoryAgg([]);
        }
      }
      
      // 필터 초기화
      setPage(0);
      setBrand([]);
      setCategory([]);
      setCategorySub([]);
      setPrice({ from: "", to: "" });
      setAppliedPrice({ from: "", to: "" });

      // 전체 검색 프로세스가 끝났을 때 최소 로딩 시간 보장
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }

    } catch (error) {
      console.error('검색 오류:', error);
      setProducts([]);
      setTotalResults(0);
      setTotalPages(0);
      setActualSearchType(null);
      
      // 에러 발생 시에도 최소 로딩 시간 보장
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
    } finally {
      setLoading(false);
      setHasSearched(true); // 검색 완료
      isInitialSearching.current = false; // 초기 검색 종료
    }
  }, [pageSize, rrfK, hybridTopK]);

  // 필터 검색 실행 (필터 변경 시 - 상품 리스트만 업데이트)
  const performFilterSearch = React.useCallback(async () => {
    // 검색어가 없어도 필터 적용 가능
    console.log('[필터 검색] 실행 - 현재 필터:', { brand, category, appliedPrice, page, sort });

    setLoading(true);
    const startTime = Date.now();
    const minLoadingTime = 400; // 필터링은 조금 더 빠르게
    
    try {
      // 정렬 필드와 순서 결정 (API 문서에 따라 sort.sortType, sort.sortOrder 사용)
      let sortType: string = 'score';
      let sortOrder: 'asc' | 'desc' = 'desc';

      if (sort === 'price_asc') {
        sortType = 'price';
        sortOrder = 'asc';
      } else if (sort === 'price_desc') {
        sortType = 'price';
        sortOrder = 'desc';
      } else if (sort === 'reviewCount') {
        sortType = 'reviewCount';
        sortOrder = 'desc';
      } else if (sort === 'registeredMonth') {
        sortType = 'registeredMonth';
        sortOrder = 'desc';
      } else if (sort === 'rating') {
        sortType = 'rating';
        sortOrder = 'desc';
      }

      // 실제 검색 타입에 따라 검색 모드 결정
      const searchMode = actualSearchType === 'vector' ? 'VECTOR_MULTI_FIELD' : 'KEYWORD_ONLY';

      const searchRequest = {
        query: searchQuery || "",
        page: page,
        size: pageSize,
        sortField: sortType,
        sortOrder: sortOrder,
        searchMode: searchMode as "KEYWORD_ONLY" | "VECTOR_MULTI_FIELD",
        rrfK,
        hybridTopK,
        ...(actualSearchType === 'vector' && { vectorMinScore: 0.7 }),
        ...(brand.length > 0 && { brand }),
        ...(category.length > 0 && { category }),
        ...(appliedPrice.from && { priceFrom: Number(appliedPrice.from) }),
        ...(appliedPrice.to && { priceTo: Number(appliedPrice.to) })
      };

      const response = await enhancedSearchApi.executeSearch(searchRequest);

      // API 응답을 Product 타입에 맞게 변환
      const transformedProducts = response.hits.data.map((item) => ({
        ...item,
        id: item.id || String(Math.floor(Math.random() * 1000000)),
        categoryName: item.categoryName || '',
        specsRaw: item.specsRaw || '',
        specs: item.specs || '',
        brand: item.brand || ''
      }));

      setProducts(transformedProducts);
      setTotalResults(response.hits.total);
      setTotalPages(response.meta.totalPages);

      // 그룹 필터: aggregation은 최초 검색 결과 유지 (업데이트하지 않음)
      // 필터 옵션은 baseBrandAgg, baseCategoryAgg를 사용

      // 최소 로딩 시간 보장
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }

    } catch (error) {
      console.error('검색 오류:', error);
      setProducts([]);
      setTotalResults(0);
      setTotalPages(0);
      
      // 에러 발생 시에도 최소 로딩 시간 보장
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, page, pageSize, sort, brand, category, appliedPrice, actualSearchType, rrfK, hybridTopK]);

  // 어제 날짜 범위를 계산하는 함수 (대시보드와 동일 포맷: 로컬 기준 YYYY-MM-DDTHH:mm:ss)
  const getYesterdayDateRange = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const y = yesterday.getFullYear();
    const m = String(yesterday.getMonth() + 1).padStart(2, '0');
    const d = String(yesterday.getDate()).padStart(2, '0');

    return {
      from: `${y}-${m}-${d}T00:00:00`,
      to: `${y}-${m}-${d}T23:59:59`  // 어제의 마지막 시간
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

  // 필터 변경 시 (필터 검색 - aggregation 유지)
  React.useEffect(() => {
    // 첫 렌더링 시에는 검색하지 않음
    if (isFirstRender.current) {
      isFirstRender.current = false;
      console.log('[필터 useEffect] 첫 렌더링 - 검색 스킵');
      return;
    }
    
    // 초기 검색 중이면 필터 검색 스킵
    if (isInitialSearching.current) {
      console.log('[필터 useEffect] 초기 검색 중 - 필터 검색 스킵');
      return;
    }
    
    // 검색을 한 번이라도 했으면 필터 검색 실행
    if (_hasSearched) {
      console.log('[필터 useEffect] 필터 검색 트리거');
      performFilterSearch();
    }
  }, [brand, category, appliedPrice, page, sort, _hasSearched, performFilterSearch]);

  // 핸들러
  const handleSearch = React.useCallback((val: string) => {
    console.log('[검색 버튼] 클릭:', val);
    setSearchQuery(val);
    setQuery(val); // 검색창에도 반영
    performInitialSearch(val); // 직접 검색 실행
  }, [performInitialSearch]);

  // 필터 초기화
  const resetFilters = () => {
    setBrand([]);
    setCategory([]);
    setCategorySub([]);
    setPrice({ from: "", to: "" });
    setAppliedPrice({ from: "", to: "" });
    setPage(0);
  };

  // 정렬 변경 핸들러
  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(0);
  };

  // 가격 검색 핸들러 - 가격 버튼을 눌렀을 때만 검색 실행
  const handlePriceSearch = () => {
    setAppliedPrice(price); // 입력한 가격을 적용
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-0 font-sans">
      <div className="w-full max-w-[80%] mx-auto">
        <SearchHeader
          query={query}
          setQuery={setQuery}
          onSearch={handleSearch}
          relatedKeywords={[]}
        />

        {/* 메인 콘텐츠: 2단 레이아웃 */}
        <div className="w-full grid grid-cols-24 gap-4 mt-2 items-start">
          {/* 중앙: 필터 + 상품리스트 */}
          <div className="col-span-19 space-y-4">
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
                searchMode={actualSearchType === 'vector' ? 'VECTOR_MULTI_FIELD' : 'KEYWORD_ONLY'}
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
                searchMode={actualSearchType === 'vector' ? 'VECTOR_MULTI_FIELD' : 'KEYWORD_ONLY'}
                actualSearchType={actualSearchType}
              />
            </div>

          {/* 우측: 인기/급등 검색어 */}
          <div className="col-span-5 flex flex-col">
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
  );
} 