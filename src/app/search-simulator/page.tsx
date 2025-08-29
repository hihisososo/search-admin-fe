import { useState } from "react"
import { apiClient } from "@/services/common/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { ProductFilters } from "../search-demo/components/ProductFilters"
import { ScoreProductList } from "./components/ScoreProductList"
import { SearchModeSelector } from "../search-demo/components/SearchModeSelector"
import { EnvironmentSelector } from "../dictionary/user/components/EnvironmentSelector"
import { DictionaryEnvironmentType } from "@/types/dashboard"
import type { Product, AggregationBucket, SearchMode } from "@/lib/api"

// 새로운 시뮬레이션 API 응답 타입
interface ExplainDetail {
    value: number
    description: string
    details?: ExplainDetail[]
}

interface SimulationSearchResponse {
    hits: {
        total: number
        data: Array<{
            id: string
            score: number
            explain?: ExplainDetail
            name: string
            nameRaw?: string
            brand: string
            category: string
            price: number
            description: string
            reviewCount?: number
            rating?: number
            thumbnailUrl?: string
            registeredMonth?: string
            [key: string]: any
        }>
    }
    aggregations?: {
        brand_name?: AggregationBucket[]
        category_name?: AggregationBucket[]
    }
    meta: {
        page: number
        size: number
        totalPages: number
        processingTime: number
    }
}

// 환경 매핑 (사전관리와 통일)
const ENV_MAPPING: Record<DictionaryEnvironmentType, string> = {
    [DictionaryEnvironmentType.CURRENT]: 'DEV', // 현재 = 개발환경
    [DictionaryEnvironmentType.DEV]: 'DEV',
    [DictionaryEnvironmentType.PROD]: 'PROD'
}

interface EnvironmentState {
    // 검색 조건
    query: string
    brand: string[]
    category: string[]
    price: { from: string; to: string }
    page: number
    sort: string
    showExplain: boolean
    applyTypoCorrection: boolean  // 🆕 오타교정 옵션 추가
    searchMode: SearchMode  // 검색 모드
    rrfK: number  // RRF K 상수
    hybridTopK: number  // 하이브리드 Top K
    vectorMinScore: number | null  // 벡터 검색 최소 점수
    lastSearchMode: SearchMode  // 실제로 검색된 모드 (정렬 옵션 표시용)
    
    // 결과 데이터
    products: (Product & { score?: number; explain?: ExplainDetail })[]
    totalResults: number
    totalPages: number
    brandAgg: AggregationBucket[]
    categoryAgg: AggregationBucket[]
    baseBrandAgg: AggregationBucket[]
    baseCategoryAgg: AggregationBucket[]
    
    // 상태
    loading: boolean
    error: string
    hasSearched: boolean
    lastSearchTime?: number
}

const initialEnvironmentState: EnvironmentState = {
    query: '',
    brand: [],
    category: [],
    price: { from: '', to: '' },
    page: 1,
    sort: 'score',
    showExplain: true,
    applyTypoCorrection: true,  // 🆕 기본값 true
    searchMode: 'KEYWORD_ONLY' as SearchMode,
    rrfK: 60,
    hybridTopK: 300,
    vectorMinScore: 0.7,
    lastSearchMode: 'KEYWORD_ONLY' as SearchMode,
    products: [],
    totalResults: 0,
    totalPages: 0,
    brandAgg: [],
    categoryAgg: [],
    baseBrandAgg: [],
    baseCategoryAgg: [],
    loading: false,
    error: '',
    hasSearched: false
}

export default function SearchSimulator() {
    const [selectedEnv, setSelectedEnv] = useState<DictionaryEnvironmentType>(DictionaryEnvironmentType.DEV)
    const [environments, setEnvironments] = useState<Record<string, EnvironmentState>>({
        DEV: { ...initialEnvironmentState },
        PROD: { ...initialEnvironmentState }
    })

    // API 응답을 Product 타입으로 변환
    const transformToProduct = (item: any): Product & { score?: number; explain?: ExplainDetail } => {
        const product = {
            id: item.id || String(Math.floor(Math.random() * 1000000)),
            name: item.name || '',
            nameRaw: item.nameRaw || item.name || '',
            model: item.model || [],
            brand: item.brand || '',
            categoryName: item.categoryName || item.category || '',
            price: item.price || 0,
            reviewCount: item.reviewCount || Math.floor(Math.random() * 1000),
            rating: item.rating || 4.5,
            thumbnailUrl: item.thumbnailUrl || `https://picsum.photos/200?random=${item.id}`,
            specs: item.specs || item.description || '',
            specsRaw: item.specsRaw || item.descriptionRaw || item.description || '',
            registeredMonth: item.registeredMonth || '2024-01',
            score: item.score,
            explain: item.explain
        }
        
        // explain 데이터 디버깅
        if (item.explain) {
            // Product explain data
        }
        
        return product
    }

    // 검색 실행
    const performSearch = async (envId: string, isInitialSearch = false, overrideParams?: Partial<EnvironmentState>) => {
        // 현재 환경 상태 가져오기
        const currentEnv = environments[envId]
        
        // 검색어 없어도 검색 가능하도록 조건 제거

        // 검색에 사용할 파라미터 (override 값이 있으면 적용)
        const searchParams = {
            query: overrideParams?.query ?? currentEnv.query,
            brand: overrideParams?.brand ?? currentEnv.brand,
            category: overrideParams?.category ?? currentEnv.category,
            price: overrideParams?.price ?? currentEnv.price,
            page: overrideParams?.page ?? currentEnv.page,
            sort: overrideParams?.sort ?? currentEnv.sort,
            showExplain: overrideParams?.showExplain ?? currentEnv.showExplain,
            applyTypoCorrection: overrideParams?.applyTypoCorrection ?? currentEnv.applyTypoCorrection,  // 🆕 오타교정 옵션
            searchMode: overrideParams?.searchMode ?? currentEnv.searchMode,
            rrfK: overrideParams?.rrfK ?? currentEnv.rrfK,
            hybridTopK: overrideParams?.hybridTopK ?? currentEnv.hybridTopK,
            vectorMinScore: overrideParams?.vectorMinScore ?? currentEnv.vectorMinScore
        }
        
        // 검색 모드가 KEYWORD_ONLY가 아니면 정렬을 score로 고정
        if (searchParams.searchMode !== 'KEYWORD_ONLY' && searchParams.sort !== 'score') {
            searchParams.sort = 'score'
        }

        // 로딩 상태 설정
        setEnvironments(prev => ({
            ...prev,
            [envId]: { 
                ...prev[envId], 
                loading: true, 
                error: '',
                hasSearched: true
            }
        }))

        const startTime = Date.now()

        try {
            // Query Parameters 구성
            const params = new URLSearchParams()
            
            // 필수 파라미터
            params.append('environmentType', envId)
            params.append('query', searchParams.query.trim())
            params.append('page', (searchParams.page - 1).toString())
            params.append('size', '10')
            
            // 선택적 파라미터
            if (searchParams.showExplain) {
                params.append('explain', 'true')
            }

            // 🆕 오타교정 옵션 추가
            params.append('applyTypoCorrection', searchParams.applyTypoCorrection.toString())
            
            // 검색 모드 관련 파라미터
            params.append('searchMode', searchParams.searchMode)
            params.append('rrfK', searchParams.rrfK.toString())
            params.append('hybridTopK', searchParams.hybridTopK.toString())
            
            // vectorMinScore 추가 (벡터 및 하이브리드 모드일 때만)
            if ((searchParams.searchMode === 'VECTOR_MULTI_FIELD' || searchParams.searchMode === 'HYBRID_RRF') && searchParams.vectorMinScore !== null) {
                params.append('vectorMinScore', searchParams.vectorMinScore.toString())
            }

            // 정렬 설정
            let sortField = 'score'
            let sortOrder: 'asc' | 'desc' = 'desc'

            if (searchParams.sort === 'price_asc') {
                sortField = 'price'
                sortOrder = 'asc'
            } else if (searchParams.sort === 'price_desc') {
                sortField = 'price'
                sortOrder = 'desc'
            } else if (searchParams.sort === 'reviewCount') {
                sortField = 'reviewCount'
                sortOrder = 'desc'
            } else if (searchParams.sort === 'registeredMonth') {
                sortField = 'registeredMonth'
                sortOrder = 'desc'
            }

            if (sortField !== 'score') {
                params.append('sortField', sortField)
                params.append('sortOrder', sortOrder)
            }

            // 필터 조건 추가
            if (searchParams.brand.length > 0) {
                searchParams.brand.forEach((b: string) => params.append('brand', b))
            }
            
            if (searchParams.category.length > 0) {
                searchParams.category.forEach((c: string) => params.append('category', c))
            }
            
            if (searchParams.price.from) {
                params.append('priceFrom', searchParams.price.from)
            }
            
            if (searchParams.price.to) {
                params.append('priceTo', searchParams.price.to)
            }

            const response = await apiClient.get<SimulationSearchResponse>('/v1/search/simulation', Object.fromEntries(params))

            const endTime = Date.now()

            // API 응답 디버깅
            // Search API response
            if (response.hits?.data?.length > 0) {
                // First product data
                if (response.hits.data[0].explain) {
                    // Explain data
                }
            }

            // 상품 데이터 변환
            const products = response.hits?.data?.map(transformToProduct) || []

            setEnvironments(prev => ({
                ...prev,
                [envId]: {
                    ...prev[envId],
                    products,
                    totalResults: response.hits?.total || 0,
                    totalPages: response.meta?.totalPages || 0,
                    loading: false,
                    lastSearchTime: endTime - startTime,
                    lastSearchMode: searchParams.searchMode,  // 실제로 검색된 모드 저장
                    // 초기 검색 시에만 aggregation 업데이트 (그룹 필터용)
                    ...(isInitialSearch && {
                        brandAgg: response.aggregations?.brand_name || [],
                        categoryAgg: response.aggregations?.category_name || [],
                        baseBrandAgg: response.aggregations?.brand_name || [],
                        baseCategoryAgg: response.aggregations?.category_name || []
                    })
                }
            }))

        } catch (err) {
            setEnvironments(prev => ({
                ...prev,
                [envId]: {
                    ...prev[envId],
                    error: err instanceof Error ? err.message : "검색 실패",
                    loading: false
                }
            }))
        }
    }

    // 환경별 상태 업데이트
    const updateEnvironmentState = (envId: string, updates: Partial<EnvironmentState>) => {
        setEnvironments(prev => ({
            ...prev,
            [envId]: { ...prev[envId], ...updates }
        }))
    }

    // 검색 실행
    const handleSearch = (envId: string, query: string) => {
        // 새로운 검색어로 검색 시 필터 초기화
        updateEnvironmentState(envId, {
            query,
            brand: [],
            category: [],
            price: { from: '', to: '' },
            page: 1
        })
        
        setTimeout(() => performSearch(envId, true), 100)
    }

    // 필터 초기화
    const resetFilters = (envId: string) => {
        const resetParams = {
            brand: [],
            category: [],
            price: { from: '', to: '' },
            page: 1
        }
        updateEnvironmentState(envId, resetParams)
        performSearch(envId, false, resetParams)
    }

    // 가격 검색
    const handlePriceSearch = (envId: string) => {
        updateEnvironmentState(envId, { page: 1 })
        performSearch(envId, false, { page: 1 })
    }

    const currentEnvId = ENV_MAPPING[selectedEnv]
    const envState = environments[currentEnvId]
    
    // 검색 모드 변경 핸들러
    const handleSearchModeChange = (newMode: SearchMode) => {
        updateEnvironmentState(currentEnvId, { 
            searchMode: newMode
            // 정렬은 실제 검색 시에만 변경됨
        })
        // 자동 재검색 제거 - 사용자가 검색 버튼을 눌러야 검색됨
    }

    return (
        <div className="p-6">
            <div className="space-y-4">
                {/* 검색창 */}
                <div className="space-y-3">
                    {/* 환경 선택 */}
                    <div className="flex justify-start">
                        <EnvironmentSelector
                            value={selectedEnv}
                            onChange={setSelectedEnv}
                        />
                    </div>
                    
                    {/* 검색 모드 선택 */}
                    <SearchModeSelector
                        searchMode={envState.searchMode}
                        setSearchMode={handleSearchModeChange}
                        rrfK={envState.rrfK}
                        setRrfK={(k) => updateEnvironmentState(currentEnvId, { rrfK: k })}
                        hybridTopK={envState.hybridTopK}
                        setHybridTopK={(k) => updateEnvironmentState(currentEnvId, { hybridTopK: k })}
                        vectorMinScore={envState.vectorMinScore}
                        setVectorMinScore={(score) => updateEnvironmentState(currentEnvId, { vectorMinScore: score })}
                    />
                    
                    <div className="flex gap-2">
                                <Input
                                    value={envState.query}
                                    onChange={(e) => updateEnvironmentState(selectedEnv, { query: e.target.value })}
                                    placeholder="검색할 키워드를 입력하세요"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearch(selectedEnv, envState.query)
                                        }
                                    }}
                                    className="flex-1 max-w-md"
                                />
                                <Button
                                    onClick={() => handleSearch(currentEnvId, envState.query)}
                                    disabled={envState.loading}
                                    variant="outline"
                                    className="px-4"
                                >
                                    {envState.loading ? (
                                        <div className="w-3 h-3 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Search className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            
                    {/* 검색 옵션들 */}
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs">
                                    <input
                                        type="checkbox"
                                        checked={envState.showExplain}
                                        onChange={(e) => updateEnvironmentState(selectedEnv, { showExplain: e.target.checked })}
                                        className="rounded w-3.5 h-3.5"
                                    />
                                    <span>Explain</span>
                                </label>
                                
                        {/* 오타교정 옵션 */}
                        <label className="flex items-center gap-1.5 text-xs">
                                    <input
                                        type="checkbox"
                                        checked={envState.applyTypoCorrection}
                                        onChange={(e) => updateEnvironmentState(currentEnvId, { applyTypoCorrection: e.target.checked })}
                                        className="rounded w-3.5 h-3.5"
                                    />
                                    <span>오타교정</span>
                                </label>
                            </div>

                    {/* 에러 메시지 */}
                    {envState.error && (
                        <div className="text-red-600 text-sm p-3 bg-red-50 rounded border border-red-200">
                            {envState.error}
                        </div>
                    )}
                </div>

                {/* 필터 */}
                <div>
                    <ProductFilters
                            searchMode={envState.searchMode}
                            category={envState.category}
                            setCategory={(category) => {
                                if (typeof category === 'function') {
                                    const newCategory = category(envState.category)
                                    updateEnvironmentState(currentEnvId, { category: newCategory, page: 1 })
                                    performSearch(currentEnvId, false, { category: newCategory, page: 1 })
                                } else {
                                    updateEnvironmentState(currentEnvId, { category, page: 1 })
                                    performSearch(currentEnvId, false, { category, page: 1 })
                                }
                            }}
                            categorySub={[]}
                            setCategorySub={() => {}}
                            brand={envState.brand}
                            setBrand={(brand) => {
                                if (typeof brand === 'function') {
                                    const newBrand = brand(envState.brand)
                                    updateEnvironmentState(currentEnvId, { brand: newBrand, page: 1 })
                                    performSearch(currentEnvId, false, { brand: newBrand, page: 1 })
                                } else {
                                    updateEnvironmentState(currentEnvId, { brand, page: 1 })
                                    performSearch(currentEnvId, false, { brand, page: 1 })
                                }
                            }}
                            price={envState.price}
                            setPrice={(price) => {
                                if (typeof price === 'function') {
                                    const newPrice = price(envState.price)
                                    updateEnvironmentState(currentEnvId, { price: newPrice })
                                } else {
                                    updateEnvironmentState(currentEnvId, { price })
                                }
                            }}
                            brandAgg={envState.baseBrandAgg}
                            categoryAgg={envState.baseCategoryAgg}
                            onResetFilters={() => resetFilters(currentEnvId)}
                            onPriceSearch={() => handlePriceSearch(currentEnvId)}
                        />
                </div>

                {/* 상품 목록 */}
                {envState.hasSearched && (
                    <ScoreProductList
                        products={envState.products}
                        loading={envState.loading}
                        totalResults={envState.totalResults}
                        totalPages={envState.totalPages}
                        page={envState.page}
                        setPage={(page: number) => {
                            updateEnvironmentState(currentEnvId, { page })
                            performSearch(currentEnvId, false, { page })
                        }}
                        sort={envState.sort}
                        onSortChange={(sort: string) => {
                            updateEnvironmentState(currentEnvId, { sort, page: 1 })
                            performSearch(currentEnvId, false, { sort, page: 1 })
                        }}
                        searchQuery={envState.query}
                        showExplain={envState.showExplain}
                        searchMode={envState.lastSearchMode}  // 실제로 검색된 모드 전달
                    />
                )}
        </div>
    </div>
    )
} 