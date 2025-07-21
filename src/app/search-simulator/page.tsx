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
    const transformToProduct = (item: any): Product & { score?: number; explain?: ExplainDetail } => ({
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
    })

    // 검색 실행
    const performSearch = async (envId: string, isInitialSearch = false) => {
        const env = environments[envId]
        
        if (!env.query.trim() && isInitialSearch) {
            return
        }

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
            params.append('query', env.query.trim())
            params.append('page', env.page.toString())
            params.append('size', '10')
            
            // 선택적 파라미터
            if (env.showExplain) {
                params.append('explain', 'true')
            }

            // 정렬 설정
            let sortField = 'score'
            let sortOrder: 'asc' | 'desc' = 'desc'

            if (env.sort === 'price_asc') {
                sortField = 'price'
                sortOrder = 'asc'
            } else if (env.sort === 'price_desc') {
                sortField = 'price'
                sortOrder = 'desc'
            } else if (env.sort === 'reviewCount') {
                sortField = 'reviewCount'
                sortOrder = 'desc'
            } else if (env.sort === 'registeredMonth') {
                sortField = 'registeredMonth'
                sortOrder = 'desc'
            }

            if (sortField !== 'score') {
                params.append('sortField', sortField)
                params.append('sortOrder', sortOrder)
            }

            // 필터 조건 추가
            if (env.brand.length > 0) {
                env.brand.forEach(b => params.append('brand', b))
            }
            
            if (env.category.length > 0) {
                env.category.forEach(c => params.append('category', c))
            }
            
            if (env.price.from) {
                params.append('priceFrom', env.price.from)
            }
            
            if (env.price.to) {
                params.append('priceTo', env.price.to)
            }

            const response = await apiFetch<SimulationSearchResponse>(`/api/v1/search/simulation?${params.toString()}`, {
                method: 'GET'
            })

            const endTime = Date.now()

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

        // 필터 변경 시 자동 검색 (검색어가 있는 경우에만)
        if (environments[envId].query && (updates.brand || updates.category || updates.page || updates.sort)) {
            setTimeout(() => performSearch(envId, false), 100)
        }
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
        updateEnvironmentState(envId, {
            brand: [],
            category: [],
            price: { from: '', to: '' },
            page: 1
        })
    }

    // 가격 검색
    const handlePriceSearch = (envId: string) => {
        updateEnvironmentState(envId, { page: 1 })
        setTimeout(() => performSearch(envId, false), 100)
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
                            
                            {/* Explain 옵션 */}
                            <div className="flex items-center gap-2">
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
                                } else {
                                    updateEnvironmentState(selectedEnv, { category, page: 1 })
                                }
                            }}
                            categorySub={[]}
                            setCategorySub={() => {}}
                            brand={envState.brand}
                            setBrand={(brand) => {
                                if (typeof brand === 'function') {
                                    const newBrand = brand(envState.brand)
                                    updateEnvironmentState(selectedEnv, { brand: newBrand, page: 1 })
                                } else {
                                    updateEnvironmentState(selectedEnv, { brand, page: 1 })
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
                        setPage={(page: number) => updateEnvironmentState(selectedEnv, { page })}
                        sort={envState.sort}
                        onSortChange={(sort: string) => updateEnvironmentState(selectedEnv, { sort, page: 1 })}
                        searchQuery={envState.query}
                        showExplain={envState.showExplain}
                    />
                )}
            </div>
        </div>
    )
} 