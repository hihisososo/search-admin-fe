import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { QueryInput } from "./components/QueryInput"
import { SearchResults } from "./components/SearchResults"
import { SaveQueryDialog } from "./components/SaveQueryDialog"
import { LoadQueryDialog } from "./components/LoadQueryDialog"
import type { 
    IndexItem, 
    SearchResponse, 
    SavedQuery, 
    PageResponse
} from "./types"

export default function SearchSimulator() {
    const [indexes, setIndexes] = useState<IndexItem[]>([])
    const [selectedIndex, setSelectedIndex] = useState<string>("")
    const [query, setQuery] = useState(`{
  "query": {
    "match_all": {}
  },
  "size": 10
}`)
    const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    
    // 쿼리 저장 관련
    const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([])
    const [queryName, setQueryName] = useState("")
    const [queryDescription, setQueryDescription] = useState("")
    const [saving, setSaving] = useState(false)
    const [saveDialogOpen, setSaveDialogOpen] = useState(false)
    const [loadDialogOpen, setLoadDialogOpen] = useState(false)



    // 인덱스 목록 조회
    const fetchIndexes = async () => {
        try {
            const response = await apiFetch<IndexItem[]>(`/api/v1/search/indexes`)
            setIndexes(response)
        } catch (err) {
            console.error("인덱스 조회 실패:", err)
        }
    }

    // 저장된 쿼리 목록 조회
    const fetchSavedQueries = async () => {
        try {
            const params = new URLSearchParams({
                page: "0",
                size: "100",
                sortBy: "updatedAt",
                sortDir: "desc"
            })
            const response = await apiFetch<PageResponse<SavedQuery>>(`/api/v1/search/queries?${params}`)
            setSavedQueries(response.content)
        } catch (err) {
            console.error("저장된 쿼리 조회 실패:", err)
        }
    }

    // 검색 실행
    const handleSearch = async () => {
        if (!selectedIndex) {
            setError("인덱스를 선택해주세요.")
            return
        }

        if (!query.trim()) {
            setError("쿼리를 입력해주세요.")
            return
        }

        setLoading(true)
        setError("")
        try {
            const parsedQuery = JSON.parse(query)
            const response = await apiFetch<SearchResponse>(`/api/v1/search/execute`, {
                method: 'POST',
                body: JSON.stringify({
                    indexName: selectedIndex,
                    queryDsl: JSON.stringify(parsedQuery)
                })
            })
            setSearchResults(response)
        } catch (err) {
            if (err instanceof SyntaxError) {
                setError("쿼리 JSON 형식이 올바르지 않습니다.")
            } else {
                setError(err instanceof Error ? err.message : "검색 실패")
            }
        } finally {
            setLoading(false)
        }
    }

    // 쿼리 저장
    const handleSaveQuery = async () => {
        if (!queryName.trim()) {
            setError("쿼리 이름을 입력해주세요.")
            return
        }

        if (!query.trim()) {
            setError("쿼리를 입력해주세요.")
            return
        }

        if (!selectedIndex) {
            setError("인덱스를 선택해주세요.")
            return
        }

        setSaving(true)
        try {
            const response = await apiFetch<SavedQuery>(`/api/v1/search/queries`, {
                method: 'POST',
                body: JSON.stringify({
                    name: queryName.trim(),
                    description: queryDescription.trim() || undefined,
                    queryDsl: query.trim(),
                    indexName: selectedIndex
                })
            })
            setSavedQueries(prev => [response, ...prev])
            setQueryName("")
            setQueryDescription("")
            setSaveDialogOpen(false)
            alert("쿼리가 성공적으로 저장되었습니다.")
        } catch (err) {
            setError(err instanceof Error ? err.message : "쿼리 저장 실패")
        } finally {
            setSaving(false)
        }
    }

    // 저장된 쿼리 불러오기
    const handleLoadQuery = (savedQuery: SavedQuery) => {
        setQuery(savedQuery.queryDsl)
        setSelectedIndex(savedQuery.indexName)
        setQueryName(savedQuery.name)
        setQueryDescription(savedQuery.description || "")
        setLoadDialogOpen(false)
    }

    // 저장된 쿼리 삭제
    const handleDeleteQuery = async (id: number) => {
        if (!confirm("정말로 삭제하시겠습니까?")) return
        
        try {
            await apiFetch(`/api/v1/search/queries/${id}`, { method: 'DELETE' })
            setSavedQueries(prev => prev.filter(q => q.id !== id))
            alert("쿼리가 성공적으로 삭제되었습니다.")
        } catch (err) {
            alert(err instanceof Error ? err.message : "삭제 실패")
        }
    }

    useEffect(() => {
        fetchIndexes()
        fetchSavedQueries()
    }, [])

    return (
        <div className="flex h-screen">
            {/* 왼쪽 패널 - 컨트롤 영역 (1/3) */}
            <div className="w-1/3 p-6 border-r bg-white flex flex-col">
                <div className="flex-1 flex flex-col">
                    <QueryInput
                        indexes={indexes}
                        selectedIndex={selectedIndex}
                        onSelectedIndexChange={setSelectedIndex}
                        query={query}
                        onQueryChange={setQuery}
                        loading={loading}
                        onSearch={handleSearch}
                        onSaveDialog={() => setSaveDialogOpen(true)}
                        onLoadDialog={() => setLoadDialogOpen(true)}
                    />
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <div className="text-red-600 text-sm p-3 bg-red-50 rounded-md border border-red-200 mt-4 flex-shrink-0">
                        {error}
                    </div>
                )}
            </div>

            {/* 오른쪽 패널 - 검색 결과 영역 (2/3) */}
            <div className="w-2/3 p-6 flex flex-col">
                <SearchResults searchResults={searchResults} />
            </div>

            {/* 쿼리 저장 다이얼로그 */}
            <SaveQueryDialog
                open={saveDialogOpen}
                onOpenChange={setSaveDialogOpen}
                queryName={queryName}
                onQueryNameChange={setQueryName}
                queryDescription={queryDescription}
                onQueryDescriptionChange={setQueryDescription}
                saving={saving}
                onSave={handleSaveQuery}
            />

            {/* 쿼리 불러오기 다이얼로그 */}
            <LoadQueryDialog
                open={loadDialogOpen}
                onOpenChange={setLoadDialogOpen}
                savedQueries={savedQueries}
                onLoadQuery={handleLoadQuery}
                onDeleteQuery={handleDeleteQuery}
            />
        </div>
    )
} 