import { useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Server, Search } from "lucide-react"
import { ProductFilters } from "../search-demo/components/ProductFilters"
import { ScoreProductList } from "./components/ScoreProductList"
import type { Product, AggregationBucket } from "@/lib/api"

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
        brand?: AggregationBucket[]
        category?: AggregationBucket[]
    }
    meta: {
        page: number
        size: number
        totalPages: number
        processingTime: number
    }
}

interface SearchEnvironment {
    id: 'DEV' | 'PROD'
    name: string
    description: string
    color: string
}

const ENVIRONMENTS: SearchEnvironment[] = [
    {
        id: 'DEV',
        name: '개발환경',
        description: 'DEV',
        color: 'bg-blue-500'
    },
    {
        id: 'PROD',
        name: '운영환경', 
        description: 'PROD',
        color: 'bg-gray-800'
    }
]

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
    showExplain: false,
    applyTypoCorrection: true,  // 🆕 기본값 true
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
    const [selectedEnv, setSelectedEnv] = useState<'DEV' | 'PROD'>('DEV')
    const [environments, setEnvironments] = useState<Record<string, EnvironmentState>>({
        DEV: { ...initialEnvironmentState },
        PROD: { ...initialEnvironmentState }
    })

    // API 응답을 Product 타입으로 변환
    const transformToProduct = (item: any): Product & { score?: number; explain?: ExplainDetail } => {
        const product = {
            id: parseInt(item.id) || Math.floor(Math.random() * 1000000),
            name: item.name || '',
            nameRaw: item.nameRaw || item.name || '',
            brand: item.brand || '',
            category: item.category || '',
            price: item.price || 0,
            lowestPrice: item.price || 0,
            reviewCount: item.reviewCount || Math.floor(Math.random() * 1000),
            rating: item.rating || 4.5,
            thumbnailUrl: item.thumbnailUrl || `https://picsum.photos/200?random=${item.id}`,
            description: item.description || '',
            descriptionRaw: item.description || '',
            registeredMonth: item.registeredMonth || '2024-01',
            score: item.score,
            explain: item.explain
        }
        
        // explain 데이터 디버깅
        if (item.explain) {
            console.log('🔍 변환된 상품의 explain:', item.id, item.explain)
        }
        
        return product
    }

    // 검색 실행
    const performSearch = async (envId: string, isInitialSearch = false, overrideParams?: Partial<EnvironmentState>) => {
        // 현재 환경 상태 가져오기
        const currentEnv = environments[envId]
        
        if (!currentEnv.query.trim() && isInitialSearch) {
            return
        }

        // 검색에 사용할 파라미터 (override 값이 있으면 적용)
        const searchParams = {
            query: overrideParams?.query ?? currentEnv.query,
            brand: overrideParams?.brand ?? currentEnv.brand,
            category: overrideParams?.category ?? currentEnv.category,
            price: overrideParams?.price ?? currentEnv.price,
            page: overrideParams?.page ?? currentEnv.page,
            sort: overrideParams?.sort ?? currentEnv.sort,
            showExplain: overrideParams?.showExplain ?? currentEnv.showExplain,
            applyTypoCorrection: overrideParams?.applyTypoCorrection ?? currentEnv.applyTypoCorrection  // 🆕 오타교정 옵션
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
            params.append('page', searchParams.page.toString())
            params.append('size', '10')
            
            // 선택적 파라미터
            if (searchParams.showExplain) {
                params.append('explain', 'true')
            }

            // 🆕 오타교정 옵션 추가
            params.append('applyTypoCorrection', searchParams.applyTypoCorrection.toString())

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

            const response = await apiFetch<SimulationSearchResponse>(`/api/v1/search/simulation?${params.toString()}`, {
                method: 'GET'
            })

            const endTime = Date.now()

            // API 응답 디버깅
            console.log('🔍 검색 API 응답:', response)
            if (response.hits?.data?.length > 0) {
                console.log('🔍 첫 번째 상품 데이터:', response.hits.data[0])
                if (response.hits.data[0].explain) {
                    console.log('🔍 Explain 데이터:', response.hits.data[0].explain)
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
                    // 초기 검색 시에만 aggregation 업데이트 (그룹 필터용)
                    ...(isInitialSearch && {
                        brandAgg: response.aggregations?.brand || [],
                        categoryAgg: response.aggregations?.category || [],
                        baseBrandAgg: response.aggregations?.brand || [],
                        baseCategoryAgg: response.aggregations?.category || []
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

    const currentEnv = ENVIRONMENTS.find(env => env.id === selectedEnv)!
    const envState = environments[selectedEnv]

    return (
        <div className="bg-gray-50 min-h-screen p-3">
            <div className="max-w-6xl mx-auto">
                {/* 환경 선택 탭 */}
                <div className="mb-3">
                    <div className="flex gap-2">
                        {ENVIRONMENTS.map((env) => (
                            <Button
                                key={env.id}
                                onClick={() => setSelectedEnv(env.id)}
                                variant={selectedEnv === env.id ? "default" : "outline"}
                                className={`${selectedEnv === env.id ? env.color : 'border-gray-300'} h-8 px-3 text-xs`}
                                size="sm"
                            >
                                <Server className="h-3 w-3 mr-1" />
                                {env.name}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* 검색창 */}
                <Card className="shadow-sm border-gray-200 mb-3">
                    <CardContent className="p-3">
                        <div className="space-y-2">
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
                                    className="flex-1 h-8 text-xs"
                                />
                                <Button
                                    onClick={() => handleSearch(selectedEnv, envState.query)}
                                    disabled={envState.loading}
                                    className={`px-3 h-8 ${currentEnv.color} hover:opacity-90`}
                                    size="sm"
                                >
                                    {envState.loading ? (
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Search className="h-3 w-3" />
                                    )}
                                </Button>
                            </div>
                            
                            {/* 검색 옵션들 */}
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-1 text-xs">
                                    <input
                                        type="checkbox"
                                        checked={envState.showExplain}
                                        onChange={(e) => updateEnvironmentState(selectedEnv, { showExplain: e.target.checked })}
                                        className="rounded w-3 h-3"
                                    />
                                    <span>Explain 포함</span>
                                </label>
                                <Badge variant="outline" className="text-xs text-gray-500 px-1 py-0">
                                    느려질 수 있음
                                </Badge>
                                
                                {/* 🆕 오타교정 옵션 */}
                                <label className="flex items-center gap-1 text-xs">
                                    <input
                                        type="checkbox"
                                        checked={envState.applyTypoCorrection}
                                        onChange={(e) => updateEnvironmentState(selectedEnv, { applyTypoCorrection: e.target.checked })}
                                        className="rounded w-3 h-3"
                                    />
                                    <span>오타 자동교정</span>
                                </label>
                                <Badge variant="outline" className="text-xs text-green-600 px-1 py-0">
                                    실시간 적용
                                </Badge>
                            </div>

                            {/* 에러 메시지 */}
                            {envState.error && (
                                <div className="text-red-600 text-xs p-2 bg-red-50 rounded border border-red-200">
                                    {envState.error}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 필터 */}
                {envState.hasSearched && (
                    <div className="mb-2">
                        <ProductFilters
                            category={envState.category}
                            setCategory={(category) => {
                                if (typeof category === 'function') {
                                    const newCategory = category(envState.category)
                                    updateEnvironmentState(selectedEnv, { category: newCategory, page: 1 })
                                    performSearch(selectedEnv, false, { category: newCategory, page: 1 })
                                } else {
                                    updateEnvironmentState(selectedEnv, { category, page: 1 })
                                    performSearch(selectedEnv, false, { category, page: 1 })
                                }
                            }}
                            categorySub={[]}
                            setCategorySub={() => {}}
                            brand={envState.brand}
                            setBrand={(brand) => {
                                if (typeof brand === 'function') {
                                    const newBrand = brand(envState.brand)
                                    updateEnvironmentState(selectedEnv, { brand: newBrand, page: 1 })
                                    performSearch(selectedEnv, false, { brand: newBrand, page: 1 })
                                } else {
                                    updateEnvironmentState(selectedEnv, { brand, page: 1 })
                                    performSearch(selectedEnv, false, { brand, page: 1 })
                                }
                            }}
                            price={envState.price}
                            setPrice={(price) => {
                                if (typeof price === 'function') {
                                    const newPrice = price(envState.price)
                                    updateEnvironmentState(selectedEnv, { price: newPrice })
                                } else {
                                    updateEnvironmentState(selectedEnv, { price })
                                }
                            }}
                            brandAgg={envState.baseBrandAgg}
                            categoryAgg={envState.baseCategoryAgg}
                            onResetFilters={() => resetFilters(selectedEnv)}
                            onPriceSearch={() => handlePriceSearch(selectedEnv)}
                        />
                    </div>
                )}

                {/* 상품 목록 */}
                {envState.hasSearched && (
                    <ScoreProductList
                        products={envState.products}
                        loading={envState.loading}
                        totalResults={envState.totalResults}
                        totalPages={envState.totalPages}
                        page={envState.page}
                        setPage={(page: number) => {
                            updateEnvironmentState(selectedEnv, { page })
                            performSearch(selectedEnv, false, { page })
                        }}
                        sort={envState.sort}
                        onSortChange={(sort: string) => {
                            updateEnvironmentState(selectedEnv, { sort, page: 1 })
                            performSearch(selectedEnv, false, { sort, page: 1 })
                        }}
                        searchQuery={envState.query}
                        showExplain={envState.showExplain}
                    />
                )}
            </div>
        </div>
    )
} 