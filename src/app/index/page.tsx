import { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Download, Play } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "@/lib/api"

interface IndexItem {
    id: number
    name: string
    description?: string
    status: string
    docCount: number
    size: number
    lastIndexedAt?: string
    updatedAt: string
    fileName?: string
    mappings?: {
        properties: Record<string, any>
    }
    settings?: {
        number_of_shards: number
        number_of_replicas: number
    }
}

interface PageResponse<T> {
    content: T[]
    page: number
    size: number
    totalElements: number
    totalPages: number
}

export default function IndexManagement() {
    const navigate = useNavigate()
    const [indexes, setIndexes] = useState<IndexItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [search, setSearch] = useState("")
    const [searchInput, setSearchInput] = useState("")
    const [executingIndexes, setExecutingIndexes] = useState<Set<number>>(new Set())

    const fetchIndexes = async () => {
        setLoading(true)
        setError("")
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: "20",
                sortBy: "updatedAt",
                sortDir: "desc",
                ...(search && { search })
            })
            const response = await apiFetch<PageResponse<IndexItem>>(`/api/v1/indexes?${params}`)
            setIndexes(response.content || [])
            setTotal(response.totalElements || 0)
        } catch (err) {
            setError(err instanceof Error ? err.message : "목록 조회 실패")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("정말로 삭제하시겠습니까?")) return
        try {
            await apiFetch(`/api/v1/indexes/${id}`, { method: 'DELETE' })
            alert("색인이 성공적으로 삭제되었습니다.")
            fetchIndexes()
        } catch (err) {
            alert(err instanceof Error ? err.message : "삭제 실패")
        }
    }

    const handleRunIndex = async (id: number) => {
        if (!confirm("색인을 실행하시겠습니까?")) return
        
        setExecutingIndexes(prev => new Set([...prev, id]))
        try {
            await apiFetch(`/api/v1/indexes/${id}/run`, { method: 'POST' })
            alert("색인이 성공적으로 실행되었습니다.")
            fetchIndexes()
        } catch (err) {
            alert(err instanceof Error ? err.message : "색인 실행 실패")
        } finally {
            setExecutingIndexes(prev => {
                const newSet = new Set(prev)
                newSet.delete(id)
                return newSet
            })
        }
    }

    const handleDownload = async (id: number) => {
        try {
            const response = await apiFetch<{presignedUrl: string}>(`/api/v1/indexes/${id}/download`)
            const link = document.createElement('a')
            link.href = response.presignedUrl
            link.click()
        } catch (err) {
            alert(err instanceof Error ? err.message : "다운로드 실패")
        }
    }

    const handleSearch = () => {
        setSearch(searchInput)
        setPage(1)
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
    }

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes}B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ko-KR')
    }

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { text: string; className: string }> = {
            INDEXED: { text: "색인완료", className: "bg-green-100 text-green-800" },
            INDEXING: { text: "색인중", className: "bg-blue-100 text-blue-800" },
            CREATED: { text: "생성완료", className: "bg-yellow-100 text-yellow-800" },
            CREATING: { text: "생성중", className: "bg-orange-100 text-orange-800" },
            FAILED: { text: "실패", className: "bg-red-100 text-red-800" },
        }
        const config = statusMap[status] || { text: status, className: "bg-gray-100 text-gray-800" }
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
                {config.text}
            </span>
        )
    }

    useEffect(() => {
        fetchIndexes()
    }, [page, search])

    const totalPages = Math.ceil(total / 20)
    const startPage = Math.max(1, page - 2)
    const endPage = Math.min(totalPages, page + 2)
    
    return (
        <div className="p-6 space-y-6">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>색인관리</CardTitle>
                    <CardDescription>
                        색인 정보를 한눈에 확인하고 관리할 수 있는 리스트 페이지입니다.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>색인 목록</CardTitle>
                            {search && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    '{search}' 검색 결과 {total}개
                                </p>
                            )}
                        </div>
                        <Button onClick={() => navigate('/index/add')}>
                            <Plus className="h-4 w-4 mr-2" />
                            새 색인 추가
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 mb-4 max-w-sm">
                        <Input 
                            placeholder="색인명으로 검색..." 
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button variant="outline" size="icon" onClick={handleSearch} title="검색">
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-md">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                색인 목록 로딩 중...
                            </div>
                        </div>
                    ) : (
                        <>
                            {indexes.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <div className="mb-4">등록된 색인이 없습니다.</div>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>색인 이름</TableHead>
                                            <TableHead>설명</TableHead>
                                            <TableHead>상태</TableHead>
                                            <TableHead>문서수</TableHead>
                                            <TableHead>크기</TableHead>
                                            <TableHead>최근업데이트</TableHead>
                                            <TableHead>관리</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {indexes.map((index) => (
                                            <TableRow key={index.id}>
                                                <TableCell 
                                                    className="font-medium cursor-pointer text-primary hover:underline" 
                                                    onClick={() => navigate(`/index/view/${index.id}`)}
                                                >
                                                    {index.name}
                                                </TableCell>
                                                <TableCell>{index.description || '-'}</TableCell>
                                                <TableCell>{getStatusBadge(index.status)}</TableCell>
                                                <TableCell>{index.docCount.toLocaleString()}</TableCell>
                                                <TableCell>{formatSize(index.size)}</TableCell>
                                                <TableCell>{formatDate(index.updatedAt)}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => handleRunIndex(index.id)}
                                                            disabled={index.status === 'INDEXING' || index.status === 'CREATING' || executingIndexes.has(index.id)}
                                                            title={executingIndexes.has(index.id) ? '색인 실행 중...' : index.status === 'INDEXING' ? '색인 진행 중...' : index.status === 'CREATING' ? '색인 생성 중...' : '색인 실행'}
                                                        >
                                                            {executingIndexes.has(index.id) ? 
                                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div> : 
                                                                <Play className="h-3 w-3 mr-1" />
                                                            }
                                                            색인
                                                        </Button>
                                                        {index.fileName && (
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                onClick={() => handleDownload(index.id)}
                                                                title="파일 다운로드"
                                                            >
                                                                <Download className="h-3 w-3 mr-1" />
                                                                다운로드
                                                            </Button>
                                                        )}
                                                        <Button 
                                                            size="sm" 
                                                            variant="destructive" 
                                                            onClick={() => handleDelete(index.id)}
                                                        >
                                                            삭제
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            {/* 페이지네이션 */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-6">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        disabled={page <= 1}
                                        onClick={() => handlePageChange(page - 1)}
                                    >
                                        이전
                                    </Button>
                                    {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
                                        <Button 
                                            key={pageNum}
                                            variant={pageNum === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    ))}
                                    {endPage < totalPages && (
                                        <>
                                            <span className="mx-2 text-muted-foreground">...</span>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handlePageChange(totalPages)}
                                            >
                                                {totalPages}
                                            </Button>
                                        </>
                                    )}
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        disabled={page >= totalPages}
                                        onClick={() => handlePageChange(page + 1)}
                                    >
                                        다음
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
