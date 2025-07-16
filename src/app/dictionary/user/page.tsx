import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"
import { useNavigate } from "react-router-dom"
import { UserDictionaryHeader } from "./components/UserDictionaryHeader"
import { UserDictionaryTable } from "./components/UserDictionaryTable"

interface UserDictionaryItem {
    id: number
    keyword: string
    description?: string
    createdAt: string
    updatedAt: string
    isNew?: boolean
    isEditing?: boolean
}

interface PageResponse<T> {
    content: T[]
    page: number
    size: number
    totalElements: number
    totalPages: number
}

interface DeploymentVersion {
    id: number
    version: string
    description?: string
    snapshotCount: number
    createdAt: string
}

type SortField = 'keyword' | 'createdAt' | 'updatedAt'
type SortDirection = 'asc' | 'desc'

export default function UserDictionary() {
    const navigate = useNavigate()
    
    const [items, setItems] = useState<UserDictionaryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [search, setSearch] = useState("")
    const [sortField, setSortField] = useState<SortField>('updatedAt')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
    
    // 추가/편집 관련 상태
    const [addingItem, setAddingItem] = useState(false)
    const [newKeyword, setNewKeyword] = useState("")
    const [newDescription, setNewDescription] = useState("")
    const [editingKeyword, setEditingKeyword] = useState("")
    const [editingDescription, setEditingDescription] = useState("")
    const [highlightedId, setHighlightedId] = useState<number | null>(null)
    
    // 배포 관련 상태
    const [versions, setVersions] = useState<DeploymentVersion[]>([])
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
    const [deploying, setDeploying] = useState(false)

    const fetchItems = async () => {
        setLoading(true)
        setError("")
        try {
            const params = new URLSearchParams({
                page: (page - 1).toString(),
                size: "20",
                sortBy: sortField,
                sortDir: sortDirection,
                ...(search && { search }),
                ...(selectedVersion && { version: selectedVersion })
            })
            const response = await apiFetch<PageResponse<UserDictionaryItem>>(`/api/v1/dictionaries/user?${params}`)
            setItems(response.content || [])
            setTotal(response.totalElements || 0)
        } catch (err) {
            setError(err instanceof Error ? err.message : "목록 조회 실패")
        } finally {
            setLoading(false)
        }
    }

    const fetchVersions = async () => {
        try {
            const params = new URLSearchParams({ page: "0", size: "20" })
            const response = await apiFetch<PageResponse<DeploymentVersion>>(`/api/v1/dictionaries/user/versions?${params}`)
            setVersions(response.content || [])
        } catch (err) {
            console.error("버전 조회 실패:", err)
        }
    }

    const validateKeyword = (keyword: string): boolean => {
        return keyword.trim() !== ""
    }

    const handleSort = (field: SortField) => {
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
        setNewDescription("")
    }

    const handleSaveNew = async () => {
        if (!validateKeyword(newKeyword)) {
            setError("키워드를 입력해주세요.")
            return
        }
        
        try {
            const response = await apiFetch<UserDictionaryItem>("/api/v1/dictionaries/user", {
                method: "POST",
                body: JSON.stringify({ 
                    keyword: newKeyword.trim(),
                    description: newDescription.trim() || undefined
                })
            })
            
            setAddingItem(false)
            setNewKeyword("")
            setNewDescription("")
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
        setNewDescription("")
        setError("")
    }

    const handleEdit = (item: UserDictionaryItem) => {
        setItems(prev => prev.map(i => 
            i.id === item.id 
                ? { ...i, isEditing: true }
                : { ...i, isEditing: false }
        ))
        setEditingKeyword(item.keyword)
        setEditingDescription(item.description || "")
    }

    const handleSaveEdit = async (item: UserDictionaryItem) => {
        if (!validateKeyword(editingKeyword)) {
            setError("키워드를 입력해주세요.")
            return
        }
        
        try {
            const response = await apiFetch<UserDictionaryItem>(`/api/v1/dictionaries/user/${item.id}`, {
                method: "PUT",
                body: JSON.stringify({ 
                    keyword: editingKeyword.trim(),
                    description: editingDescription.trim() || undefined
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

    const handleCancelEdit = (item: UserDictionaryItem) => {
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
            await apiFetch(`/api/v1/dictionaries/user/${id}`, { method: 'DELETE' })
            alert("사전 항목이 성공적으로 삭제되었습니다.")
            await fetchItems()
        } catch (err) {
            alert(err instanceof Error ? err.message : "삭제 실패")
        }
    }

    const handleDeploy = async () => {
        if (!confirm("사전 버전을 생성하시겠습니까?")) return
        
        setDeploying(true)
        try {
            const response = await apiFetch<DeploymentVersion>("/api/v1/dictionaries/user/versions", { 
                method: 'POST'
            })
            alert(`사전 버전이 성공적으로 생성되었습니다!\n버전: ${response.version}\n항목 수: ${response.snapshotCount}개`)
            await fetchVersions()
            await fetchItems()
        } catch (err) {
            alert(err instanceof Error ? err.message : "버전 생성 실패")
        } finally {
            setDeploying(false)
        }
    }

    const handleVersionChange = (version: string) => {
        setSelectedVersion(version || null)
        setPage(1)
    }

    useEffect(() => {
        fetchItems()
    }, [page, sortField, sortDirection, selectedVersion, search])

    useEffect(() => {
        fetchVersions()
    }, [])

    const totalPages = Math.ceil(total / 20)
    const startPage = Math.max(1, page - 2)
    const endPage = Math.min(totalPages, page + 2)

    return (
        <div className="p-6 space-y-6">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>사용자사전</CardTitle>
                    <CardDescription>
                        사용자가 정의한 단어들을 관리할 수 있습니다. "기본키워드, 유의어1, 유의어2" 형태로 등록하여 검색 시 동의어로 처리됩니다.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <UserDictionaryHeader
                        search={search}
                        onSearchChange={setSearch}
                        onSearch={handleSearch}
                        onAdd={handleAdd}
                        onDeploy={handleDeploy}
                        deploying={deploying}
                        addingItem={addingItem}
                        versions={versions}
                        selectedVersion={selectedVersion}
                        onVersionChange={handleVersionChange}
                    />
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-md">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                사전 목록 로딩 중...
                            </div>
                        </div>
                    ) : (
                        <>
                            <UserDictionaryTable
                                items={items}
                                addingItem={addingItem}
                                newKeyword={newKeyword}
                                newDescription={newDescription}
                                editingKeyword={editingKeyword}
                                editingDescription={editingDescription}
                                highlightedId={highlightedId}
                                sortField={sortField}
                                sortDirection={sortDirection}
                                onSort={handleSort}
                                onEdit={handleEdit}
                                onSaveEdit={handleSaveEdit}
                                onCancelEdit={handleCancelEdit}
                                onDelete={handleDelete}
                                onNewKeywordChange={setNewKeyword}
                                onNewDescriptionChange={setNewDescription}
                                onEditingKeywordChange={setEditingKeyword}
                                onEditingDescriptionChange={setEditingDescription}
                                onSaveNew={handleSaveNew}
                                onCancelNew={handleCancelNew}
                                validateKeyword={validateKeyword}
                            />

                            {items.length === 0 && !addingItem && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <div className="mb-4">등록된 사전 항목이 없습니다.</div>
                                </div>
                            )}

                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-6">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        disabled={page <= 1}
                                        onClick={() => setPage(page - 1)}
                                    >
                                        이전
                                    </Button>
                                    {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
                                        <Button 
                                            key={pageNum}
                                            variant={pageNum === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setPage(pageNum)}
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
                                                onClick={() => setPage(totalPages)}
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