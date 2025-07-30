import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"
import { DictionaryEnvironmentType } from "@/types/dashboard"
import type { DictionaryItem, DictionaryPageResponse, DictionarySortField, DictionarySortDirection } from "@/types/dashboard"
import { EnvironmentSelector } from "../user/components/EnvironmentSelector"
import { StopwordDictionaryHeader } from "./components/StopwordDictionaryHeader"
import { StopwordDictionaryTable } from "./components/StopwordDictionaryTable"

export default function StopwordDictionary() {
    const [items, setItems] = useState<DictionaryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [search, setSearch] = useState("")
    const [sortField, setSortField] = useState<DictionarySortField>('updatedAt')
    const [sortDirection, setSortDirection] = useState<DictionarySortDirection>('desc')
    const [environment, setEnvironment] = useState<DictionaryEnvironmentType>(DictionaryEnvironmentType.CURRENT)
    
    // 추가/편집 관련 상태
    const [addingItem, setAddingItem] = useState(false)
    const [newKeyword, setNewKeyword] = useState("")
    const [editingKeyword, setEditingKeyword] = useState("")
    const [highlightedId, setHighlightedId] = useState<number | null>(null)

    const fetchItems = async () => {
        setLoading(true)
        setError("")
        try {
            const params = new URLSearchParams({
                page: (page - 1).toString(),
                size: "20",
                sortBy: sortField,
                sortDir: sortDirection,
                environment: environment,
                ...(search && { search: search })
            })
            const response = await apiFetch<DictionaryPageResponse<DictionaryItem>>(`/api/v1/dictionaries/stopword?${params}`)
            setItems(response.content || [])
            setTotal(response.totalElements || 0)
        } catch (err) {
            console.error('불용어 사전 API 에러:', err)
            if (err instanceof Error) {
                if (err.message.includes('500') || err.message.includes('서버 내부 오류')) {
                    setError("서버에서 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
                } else {
                    setError(err.message)
                }
            } else {
                setError("목록 조회 중 오류가 발생했습니다.")
            }
            // 에러 발생 시 빈 배열로 설정
            setItems([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }

    const validateKeyword = (keyword: string): boolean => {
        const trimmed = keyword.trim()
        return trimmed !== "" && !trimmed.includes(',') && !trimmed.includes('=')
    }

    const handleSort = (field: DictionarySortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
        setPage(1)
    }

    const handleSearch = () => setPage(1)
    const handleAdd = () => {
        setAddingItem(true)
        setNewKeyword("")
    }



    const handleSaveNew = async () => {
        if (!validateKeyword(newKeyword)) {
            setError("불용어는 단일 단어로 입력해주세요. (콤마나 특수문자 불가)")
            return
        }
        
        try {
            const response = await apiFetch<DictionaryItem>("/api/v1/dictionaries/stopword", {
                method: "POST",
                body: JSON.stringify({ 
                    keyword: newKeyword.trim()
                })
            })
            
            setAddingItem(false)
            setNewKeyword("")
            setError("")
            setPage(1)
            setHighlightedId(response.id)
            setTimeout(() => setHighlightedId(null), 3000)
            await fetchItems()
        } catch (err) {
            setError(err instanceof Error ? err.message : "추가 실패")
        }
    }

    const handleCancelNew = () => {
        setAddingItem(false)
        setNewKeyword("")
        setError("")
    }

    const handleEdit = (item: DictionaryItem) => {
        setItems(prev => prev.map(i => 
            i.id === item.id 
                ? { ...i, isEditing: true }
                : { ...i, isEditing: false }
        ))
        setEditingKeyword(item.keyword)
    }

    const handleSaveEdit = async (item: DictionaryItem) => {
        if (!validateKeyword(editingKeyword)) {
            setError("불용어는 단일 단어로 입력해주세요. (콤마나 특수문자 불가)")
            return
        }
        
        try {
            const response = await apiFetch<DictionaryItem>(`/api/v1/dictionaries/stopword/${item.id}`, {
                method: "PUT",
                body: JSON.stringify({ 
                    keyword: editingKeyword.trim()
                })
            })
            
            setItems(prev => prev.map(i => 
                i.id === item.id 
                    ? { ...response, isEditing: false }
                    : i
            ))
            
            setError("")
            setHighlightedId(response.id)
            setTimeout(() => setHighlightedId(null), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : "수정 실패")
        }
    }

    const handleCancelEdit = (item: DictionaryItem) => {
        setItems(prev => prev.map(i => 
            i.id === item.id 
                ? { ...i, isEditing: false }
                : i
        ))
        setError("")
    }

    const handleDelete = async (id: number) => {
        if (!confirm("정말로 삭제하시겠습니까?")) return
        
        try {
            await apiFetch(`/api/v1/dictionaries/stopword/${id}`, { method: 'DELETE' })
            alert("사전 항목이 성공적으로 삭제되었습니다.")
            await fetchItems()
        } catch (err) {
            alert(err instanceof Error ? err.message : "삭제 실패")
        }
    }

    const handleEnvironmentChange = (newEnvironment: DictionaryEnvironmentType) => {
        setEnvironment(newEnvironment)
        setPage(1)
    }

    useEffect(() => {
        fetchItems()
    }, [page, sortField, sortDirection, environment, search])

    const totalPages = Math.ceil(total / 20)
    const startPage = Math.max(1, page - 2)
    const endPage = Math.min(totalPages, page + 2)

    // 편집 가능한 환경 (불용어는 현재 환경만 편집 가능)
    const canEdit = environment === DictionaryEnvironmentType.CURRENT

    return (
        <div className="p-4 space-y-4 bg-gray-50 min-h-screen">
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="pb-1">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <EnvironmentSelector
                                value={environment}
                                onChange={handleEnvironmentChange}
                            />
                        </div>
                    </div>
                    <StopwordDictionaryHeader
                        search={search}
                        onSearchChange={setSearch}
                        onSearch={handleSearch}
                        onAdd={handleAdd}
                        addingItem={addingItem}
                        environment={environment}
                        canEdit={canEdit}
                    />
                </CardHeader>
                <CardContent className="pt-0">
                    {error && (
                        <div className="text-red-700 text-sm mb-3 p-2 bg-red-50 rounded border border-red-200">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-6">
                            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                                로딩 중...
                            </div>
                        </div>
                    ) : (
                        <>
                            <StopwordDictionaryTable
                                items={items}
                                addingItem={addingItem}
                                newKeyword={newKeyword}
                                editingKeyword={editingKeyword}
                                highlightedId={highlightedId}
                                sortField={sortField}
                                sortDirection={sortDirection}
                                onSort={handleSort}
                                onEdit={handleEdit}
                                onSaveEdit={handleSaveEdit}
                                onCancelEdit={handleCancelEdit}
                                onDelete={handleDelete}
                                onNewKeywordChange={setNewKeyword}
                                onEditingKeywordChange={setEditingKeyword}
                                onSaveNew={handleSaveNew}
                                onCancelNew={handleCancelNew}
                                validateKeyword={validateKeyword}
                                environment={environment}
                                canEdit={canEdit}
                            />

                            {items.length === 0 && !addingItem && (
                                <div className="text-center py-6 text-gray-500">
                                    <div className="mb-2 text-sm">등록된 항목이 없습니다</div>
                                    <div className="text-xs text-gray-400">새로운 불용어를 추가해보세요</div>
                                </div>
                            )}

                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-1 mt-4 pt-4 border-t border-gray-100">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page <= 1}
                                        onClick={() => setPage(page - 1)}
                                        className="h-7 px-2 text-xs"
                                    >
                                        이전
                                    </Button>
                                    {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
                                        <Button
                                            key={pageNum}
                                            variant={pageNum === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setPage(pageNum)}
                                            className="h-7 px-2 text-xs min-w-[28px]"
                                        >
                                            {pageNum}
                                        </Button>
                                    ))}
                                    {endPage < totalPages && (
                                        <>
                                            <span className="mx-1 text-xs text-gray-400">...</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(totalPages)}
                                                className="h-7 px-2 text-xs"
                                            >
                                                {totalPages}
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page >= totalPages}
                                        onClick={() => setPage(page + 1)}
                                        className="h-7 px-2 text-xs"
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