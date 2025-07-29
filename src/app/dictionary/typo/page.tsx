import { useState, useEffect } from "react"
import { Card, CardHeader, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiFetch, realtimeSyncApi, typoCorrectionDictionaryApi } from "@/lib/api"
import { DictionaryEnvironmentType } from "@/types/dashboard"
import type { DictionaryItem, DictionaryPageResponse, DictionarySortField, DictionarySortDirection } from "@/types/dashboard"
import { EnvironmentSelector } from "../user/components/EnvironmentSelector"
import { TypoCorrectionDictionaryHeader } from "./components/TypoCorrectionDictionaryHeader"
import { TypoCorrectionDictionaryTable } from "./components/TypoCorrectionDictionaryTable"

export default function TypoCorrectionDictionary() {
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
    const [newCorrectedWord, setNewCorrectedWord] = useState("")
    const [editingKeyword, setEditingKeyword] = useState("")
    const [editingCorrectedWord, setEditingCorrectedWord] = useState("")
    const [highlightedId, setHighlightedId] = useState<number | null>(null)

    const fetchItems = async () => {
        setLoading(true)
        setError("")
        try {
            const params = {
                page: page - 1,
                size: 20,
                sortBy: sortField,
                sortDir: sortDirection,
                environment: environment,
                ...(search && { search: search })
            }
            const response = await typoCorrectionDictionaryApi.getList(params)
            setItems(response.content || [])
            setTotal(response.totalElements || 0)
        } catch (err) {
            console.error('오타교정 사전 API 에러:', err)
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

    const validateTypoCorrection = (keyword: string, correctedWord: string): boolean => {
        return keyword.trim() !== "" && correctedWord.trim() !== ""
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
        setNewCorrectedWord("")
    }

    // 실시간 반영 함수
    const handleApplyChanges = async () => {
        try {
            const response = await realtimeSyncApi.syncTypoCorrection(environment)
            alert(response.message || "오타교정 사전이 실시간으로 반영되었습니다.")
        } catch (err) {
            alert(err instanceof Error ? err.message : "실시간 반영 실패")
        }
    }

    const handleSaveNew = async () => {
        if (!validateTypoCorrection(newKeyword, newCorrectedWord)) {
            setError("오타 단어와 교정어를 모두 입력해주세요.")
            return
        }
        
        try {
            const response = await typoCorrectionDictionaryApi.create({ 
                keyword: newKeyword.trim(),
                correctedWord: newCorrectedWord.trim()
            })
            
            setAddingItem(false)
            setNewKeyword("")
            setNewCorrectedWord("")
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
        setNewCorrectedWord("")
        setError("")
    }

    const handleEdit = (item: DictionaryItem) => {
        setItems(prev => prev.map(i => 
            i.id === item.id 
                ? { ...i, isEditing: true }
                : { ...i, isEditing: false }
        ))
        setEditingKeyword(item.keyword)
        setEditingCorrectedWord((item as any).correctedWord || "")
    }

    const handleSaveEdit = async (item: DictionaryItem) => {
        if (!validateTypoCorrection(editingKeyword, editingCorrectedWord)) {
            setError("오타 단어와 교정어를 모두 입력해주세요.")
            return
        }
        
        try {
            const response = await typoCorrectionDictionaryApi.update(item.id, { 
                keyword: editingKeyword.trim(),
                correctedWord: editingCorrectedWord.trim()
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
            await typoCorrectionDictionaryApi.delete(id)
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

    // 편집 가능한 환경 (유의어, 오타교정은 개발용, 운영용도 수정 가능)
    const canEdit = [DictionaryEnvironmentType.CURRENT, DictionaryEnvironmentType.DEV, DictionaryEnvironmentType.PROD].includes(environment)

    return (
        <div className="p-4 space-y-4 bg-gray-50 min-h-screen">
            {/* 메인 콘텐츠 */}
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="pb-1">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <EnvironmentSelector
                                value={environment}
                                onChange={handleEnvironmentChange}
                            />
                        </div>
                        {canEdit && (
                            <Button
                                onClick={handleApplyChanges}
                                size="sm"
                                className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                실시간 반영
                            </Button>
                        )}
                    </div>
                    <TypoCorrectionDictionaryHeader
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
                        <div className="text-red-700 text-sm mb-3 p-3 bg-red-50 rounded border border-red-200">
                            <div className="flex items-center justify-between">
                                <span>{error}</span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={fetchItems}
                                    className="h-7 px-3 text-xs border-red-300 text-red-600 hover:bg-red-100"
                                >
                                    재시도
                                </Button>
                            </div>
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
                            <TypoCorrectionDictionaryTable
                                items={items}
                                addingItem={addingItem}
                                newKeyword={newKeyword}
                                newCorrectedWord={newCorrectedWord}
                                editingKeyword={editingKeyword}
                                editingCorrectedWord={editingCorrectedWord}
                                highlightedId={highlightedId}
                                sortField={sortField}
                                sortDirection={sortDirection}
                                onSort={handleSort}
                                onEdit={handleEdit}
                                onSaveEdit={handleSaveEdit}
                                onCancelEdit={handleCancelEdit}
                                onDelete={handleDelete}
                                onNewKeywordChange={setNewKeyword}
                                onNewCorrectedWordChange={setNewCorrectedWord}
                                onEditingKeywordChange={setEditingKeyword}
                                onEditingCorrectedWordChange={setEditingCorrectedWord}
                                onSaveNew={handleSaveNew}
                                onCancelNew={handleCancelNew}
                                validateTypoCorrection={validateTypoCorrection}
                                environment={environment}
                                canEdit={canEdit}
                            />

                            {items.length === 0 && !addingItem && (
                                <div className="text-center py-6 text-gray-500">
                                    {error ? (
                                        <div>
                                            <div className="mb-2 text-sm">서버 연결에 문제가 있습니다</div>
                                            <div className="text-xs text-gray-400">
                                                API 서버가 실행 중인지 확인해주세요.
                                                <br />
                                                오타교정 API v2.0 구조가 서버에 반영되었는지 확인이 필요합니다.
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="mb-2 text-sm">등록된 항목이 없습니다</div>
                                            <div className="text-xs text-gray-400">새로운 오타교정 규칙을 추가해보세요</div>
                                        </div>
                                    )}
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