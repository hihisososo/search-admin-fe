import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChevronDown, ChevronRight, Eye } from "lucide-react"
import type { Product } from "@/lib/api"

interface ExplainDetail {
    value: number
    description: string
    details?: ExplainDetail[]
}

interface ScoreProductListProps {
    products: (Product & { score?: number; explain?: ExplainDetail })[]
    loading: boolean
    totalResults: number
    totalPages: number
    page: number
    setPage: (page: number) => void
    sort: string
    onSortChange: (sort: string) => void
    searchQuery: string
    showExplain: boolean
}

const SORT_OPTIONS = [
    { label: "정확도순", value: "score" },
    { label: "낮은가격순", value: "price_asc" },
    { label: "높은가격순", value: "price_desc" },
    { label: "리뷰많은순", value: "reviewCount" },
    { label: "신상품순", value: "registeredMonth" },
]

function highlight(text: string, keyword: string) {
    if (!keyword) return text
    
    const keywords = keyword.trim().split(/\s+/).filter(k => k.length > 0)
    if (keywords.length === 0) return text
    
    const escapedKeywords = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    const regex = new RegExp(`(${escapedKeywords.join('|')})`, "gi")
    
    const parts = text.split(regex)
    return parts.map((part, i) =>
        regex.test(part)
            ? <span key={i} style={{ color: '#2563eb', fontWeight: 600 }}>{part}</span>
            : part
    )
}

// Explain 정보를 예쁘게 표시하는 컴포넌트
function ExplainTree({ explain, depth = 0 }: { explain: ExplainDetail | null | undefined; depth?: number }) {
    const [isExpanded, setIsExpanded] = useState(depth < 2)
    
    // explain이 없는 경우 방어 처리
    if (!explain) {
        return (
            <div className="text-xs text-gray-400 p-2">
                Explain 정보가 없습니다.
            </div>
        )
    }
    
    return (
        <div className={`${depth > 0 ? 'ml-4 border-l border-gray-200 pl-3' : ''}`}>
            <div className="flex items-start gap-2 py-1">
                {explain.details && explain.details.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </Button>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs font-mono">
                            {typeof explain.value === 'number' ? explain.value.toFixed(3) : 'N/A'}
                        </Badge>
                        <span className="text-xs text-gray-700 break-words">
                            {explain.description || 'No description'}
                        </span>
                    </div>
                </div>
            </div>
            
            {isExpanded && explain.details && Array.isArray(explain.details) && (
                <div className="mt-1">
                    {explain.details.map((detail, index) => (
                        <ExplainTree key={index} explain={detail} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    )
}

function LoadingRow() {
    return (
        <TableRow className="animate-pulse">
            <TableCell className="py-2">
                <Skeleton className="w-12 h-4" />
            </TableCell>
            <TableCell className="py-2">
                <Skeleton className="w-16 h-16 rounded" />
            </TableCell>
            <TableCell className="py-2">
                <div className="space-y-1 max-w-xl">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </TableCell>
            <TableCell className="text-right py-2">
                <Skeleton className="h-4 w-16 ml-auto" />
            </TableCell>
        </TableRow>
    )
}

export function ScoreProductList({
    products,
    loading,
    totalResults,
    totalPages,
    page,
    setPage,
    sort,
    onSortChange,
    searchQuery,
    showExplain
}: ScoreProductListProps) {
    return (
        <>
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                        <span className="text-sm text-blue-600 font-medium">검색 중</span>
                    </div>
                </div>
            )}
            
            <Card className="p-3 shadow-sm border border-gray-200 rounded-lg bg-white">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-600">
                        {loading ? (
                            <Skeleton className="h-4 w-24" />
                        ) : (
                            `총 ${totalResults.toLocaleString()}개`
                        )}
                    </div>
                    <div className="flex gap-1">
                        {SORT_OPTIONS.map(opt => (
                            <Button 
                                key={opt.value} 
                                variant={sort === opt.value ? "default" : "outline"} 
                                size="sm" 
                                onClick={() => onSortChange(opt.value)} 
                                className="h-6 px-2 text-xs"
                                disabled={loading}
                            >
                                {opt.label}
                            </Button>
                        ))}
                    </div>
                </div>
                
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16 text-xs">점수</TableHead>
                            <TableHead className="w-20 text-xs">이미지</TableHead>
                            <TableHead className="text-xs">상품정보</TableHead>
                            <TableHead className="text-right text-xs">가격</TableHead>
                            {showExplain && <TableHead className="w-16 text-xs">분석</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <LoadingRow key={index} />
                            ))
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={showExplain ? 5 : 4} className="text-center text-gray-400 py-4 text-xs">
                                    검색 결과가 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : products.map(p => (
                            <TableRow key={p.id} className="transition-colors hover:bg-blue-50/60">
                                {/* 점수 */}
                                <TableCell className="py-2">
                                    <div className="text-center">
                                        <Badge 
                                            variant="outline" 
                                            className="font-mono text-xs bg-blue-50 text-blue-700 border-blue-200 px-1"
                                        >
                                            {typeof p.score === 'number' ? p.score.toFixed(2) : 'N/A'}
                                        </Badge>
                                    </div>
                                </TableCell>
                                
                                {/* 이미지 */}
                                <TableCell className="py-2">
                                    <img 
                                        src={p.thumbnailUrl} 
                                        alt={p.nameRaw || p.name} 
                                        className="rounded w-16 h-16 object-cover border shadow-sm" 
                                    />
                                </TableCell>
                                
                                {/* 상품정보 */}
                                <TableCell className="py-2">
                                    <div className="space-y-1 max-w-xl">
                                        <div className="font-semibold text-sm text-gray-900 leading-tight">
                                            {searchQuery ? highlight(p.nameRaw || p.name, searchQuery) : (p.nameRaw || p.name)}
                                        </div>
                                        
                                        {p.descriptionRaw && (
                                            <div className="text-xs text-gray-500 leading-snug overflow-hidden max-h-8">
                                                {searchQuery ? highlight(p.descriptionRaw, searchQuery) : p.descriptionRaw}
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            {p.registeredMonth && (
                                                <span>{p.registeredMonth}</span>
                                            )}
                                            <span>리뷰 {p.reviewCount?.toLocaleString()}개</span>
                                        </div>
                                        
                                        <div>
                                            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                                                {p.category}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                
                                {/* 가격 */}
                                <TableCell className="text-right py-2">
                                    <div className="font-bold text-blue-700 text-sm">
                                        {p.price?.toLocaleString()}원
                                    </div>
                                </TableCell>
                                
                                {/* Explain 버튼 */}
                                {showExplain && (
                                    <TableCell className="py-2">
                                        {p.explain ? (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-6 px-2 text-xs"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle className="flex items-center gap-2">
                                                            <Badge variant="outline" className="font-mono text-xs">
                                                                점수: {typeof p.score === 'number' ? p.score.toFixed(3) : 'N/A'}
                                                            </Badge>
                                                            <span className="text-sm text-gray-600">
                                                                {p.name} - 스코어 상세 분석
                                                            </span>
                                                        </DialogTitle>
                                                    </DialogHeader>
                                                    <div className="mt-4">
                                                        <ExplainTree explain={p.explain} />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        ) : (
                                            <span className="text-xs text-gray-400">-</span>
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                
                {totalPages > 1 && !loading && (
                    <div className="space-y-2 mt-3">
                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                        <div className="text-center text-xs text-gray-500">
                            {page} / {totalPages} 페이지 (총 {totalResults.toLocaleString()}개)
                        </div>
                    </div>
                )}
            </Card>
        </>
    )
} 