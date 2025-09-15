import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
import { DataTableToolbar } from "@/components/common/DataTableToolbar"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { 
  useGenerateCandidatesAsync,
  useEvaluateLlmAsync,
  useUpdateQuery,
  useDeleteQueries,
  useCreateQuery,
} from "@/hooks/use-evaluation"
import { calculateSelectionState } from "@/utils/evaluation-helpers"
// import { EVALUATION_CONFIG } from "@/constants/evaluation"
import { ActionButtons } from "./ActionButtons"
import { PaginationControls } from "./PaginationControls"
import { QueryTableRow } from "./QueryTableRow"
import { QueryEditDialog } from "./QueryEditDialog"
import type { EvaluationQuery } from "@/services"
import { useToast } from "@/components/ui/use-toast"
// import { Search } from "lucide-react"
// no-op

interface QueryTableProps {
  queries: EvaluationQuery[]
  selectedQueryIds: number[]
  onSelectQuery: (queryId: number, queryText: string, checked: boolean) => void
  onSelectAll: (queryIds: number[], checked: boolean) => void
  onQueryClick: (queryId: number, queryText: string) => void
  onClearSelection: () => void
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onRefresh?: () => void
  isLoading: boolean
  onSearch?: (text: string) => void
  sortField?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (field: string) => void
}

export function QueryTable({
  queries,
  selectedQueryIds,
  onSelectQuery,
  onSelectAll,
  onQueryClick,
  onClearSelection,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSearch,
  onRefresh: _onRefresh,
  isLoading,
  sortField,
  sortDirection,
  onSort
}: QueryTableProps) {
  const [editingQuery, setEditingQuery] = useState<{ id: number, text: string } | null>(null)
  const { toast } = useToast()
  const [searchText, setSearchText] = useState("")
  
  // 뮤테이션
  const generateCandidatesAsyncMutation = useGenerateCandidatesAsync()
  const evaluateLlmAsyncMutation = useEvaluateLlmAsync()
  const updateQueryMutation = useUpdateQuery()
  const deleteQueryMutation = useDeleteQueries()
  const createQueryMutation = useCreateQuery()

  // 액션 핸들러들
  const handleCreateQuery = async (text: string) => {
    await createQueryMutation.mutateAsync({ value: text.trim() })
    toast({ title: '추가 완료', description: '쿼리가 성공적으로 추가되었습니다.', variant: 'success' })
  }

  const handleGenerateCandidates = async () => {
    return await generateCandidatesAsyncMutation.mutateAsync({ 
      generateForAllQueries: false, 
      queryIds: selectedQueryIds 
    })
  }

  const handleEvaluateLlm = async () => {
    return await evaluateLlmAsyncMutation.mutateAsync({ 
      evaluateAllQueries: false, 
      queryIds: selectedQueryIds 
    })
  }

  const handleUpdateQuery = async (queryId: number, newText: string) => {
    await updateQueryMutation.mutateAsync({ queryId, data: { value: newText.trim() } })
    toast({
      title: "수정 완료",
      description: "쿼리가 성공적으로 수정되었습니다.",
      variant: "success"
    })
  }

  const handleDeleteQuery = async (queryId: number) => {
    if (confirm('쿼리를 삭제하시겠습니까?')) {
      await deleteQueryMutation.mutateAsync([queryId])
      // 선택된 목록에서 해당 쿼리 제거
      if (selectedQueryIds.includes(queryId)) {
        onSelectQuery(queryId, '', false)
      }
      toast({
        title: "삭제 완료",
        description: "쿼리가 성공적으로 삭제되었습니다.",
        variant: "success"
      })
    }
  }

  const handleDeleteSelected = async () => {
    const count = selectedQueryIds.length
    await deleteQueryMutation.mutateAsync(selectedQueryIds)
    onClearSelection()
    toast({
      title: "삭제 완료",
      description: `${count}개 쿼리가 성공적으로 삭제되었습니다.`,
      variant: "success"
    })
  }

  // 전체 선택 관련 로직 (현재 페이지 기준)
  const queriesWithId = queries.map(query => ({ id: query.id }))
  const { isAllSelected } = calculateSelectionState(queriesWithId, selectedQueryIds)

  // 헤더 전체 선택 핸들러
  const handleHeaderSelectAll = (checked: boolean) => {
    const queryIds = queries.map(query => query.id)
    onSelectAll(queryIds, checked)
  }



  if (isLoading) {
    return <QueryTableSkeleton />
  }

  return (
    <div className="space-y-3">
      {/* 액션 버튼들 - 왼쪽 정렬, 검색창과 여백 확보 */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <ActionButtons
          selectedQueryIds={selectedQueryIds}
          onCreateQuery={handleCreateQuery}
          onGenerateCandidates={handleGenerateCandidates}
          onEvaluateLlm={handleEvaluateLlm}
          onDeleteSelected={handleDeleteSelected}
          isDeleting={deleteQueryMutation.isPending}
          compact
        />
      </div>

      <DataTableToolbar
        showSearch
        searchValue={searchText}
        onSearchChange={setSearchText}
        onSearch={() => onSearch?.(searchText)}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
        disabled={isLoading}
      />

      {/* 쿼리 테이블 */}
      <div className="border border-gray-200 rounded-md overflow-hidden bg-white mt-0">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="w-10 py-2">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={(checked) => {
                  handleHeaderSelectAll(checked === true)
                }}
              />
            </TableHead>
            <TableHead 
              className="py-2 text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100" 
              onClick={() => onSort?.('query')}
            >
              <div className="flex items-center gap-1">
                <span>쿼리</span>
                {sortField === 'query' && (
                  sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                )}
                {sortField !== 'query' && <ArrowUpDown className="h-3 w-3 text-gray-400" />}
              </div>
            </TableHead>
            <TableHead 
              className="py-2 text-xs font-semibold text-gray-700 text-center w-24 cursor-pointer hover:bg-gray-100"
              onClick={() => onSort?.('documentCount')}
            >
              <div className="flex items-center justify-center gap-1">
                <span>문서수</span>
                {sortField === 'documentCount' && (
                  sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                )}
                {sortField !== 'documentCount' && <ArrowUpDown className="h-3 w-3 text-gray-400" />}
              </div>
            </TableHead>
            <TableHead 
              className="py-2 text-xs font-semibold text-gray-700 text-center w-16 cursor-pointer hover:bg-gray-100" 
              onClick={() => onSort?.('score1Count')}
            >
              <div className="flex items-center justify-center gap-1">
                <span>관련</span>
                {sortField === 'score1Count' && (
                  sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                )}
                {sortField !== 'score1Count' && <ArrowUpDown className="h-3 w-3 text-gray-400" />}
              </div>
            </TableHead>
            <TableHead 
              className="py-2 text-xs font-semibold text-gray-700 text-center w-16 cursor-pointer hover:bg-gray-100" 
              onClick={() => onSort?.('score0Count')}
            >
              <div className="flex items-center justify-center gap-1">
                <span>관련없음</span>
                {sortField === 'score0Count' && (
                  sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                )}
                {sortField !== 'score0Count' && <ArrowUpDown className="h-3 w-3 text-gray-400" />}
              </div>
            </TableHead>
            <TableHead 
              className="py-2 text-xs font-semibold text-gray-700 text-center w-20 cursor-pointer hover:bg-gray-100" 
              onClick={() => onSort?.('unevaluatedCount')}
            >
              <div className="flex items-center justify-center gap-1">
                <span>미평가</span>
                {sortField === 'unevaluatedCount' && (
                  sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                )}
                {sortField !== 'unevaluatedCount' && <ArrowUpDown className="h-3 w-3 text-gray-400" />}
              </div>
            </TableHead>
            <TableHead 
              className="py-2 text-xs font-semibold text-gray-700 text-center w-32 cursor-pointer hover:bg-gray-100" 
              onClick={() => onSort?.('updatedAt')}
            >
              <div className="flex items-center justify-center gap-1">
                <span>수정일</span>
                {sortField === 'updatedAt' && (
                  sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                )}
                {sortField !== 'updatedAt' && <ArrowUpDown className="h-3 w-3 text-gray-400" />}
              </div>
            </TableHead>
            <TableHead className="py-2 text-xs font-semibold text-gray-700 text-center w-20">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {queries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                <p className="text-sm">등록된 쿼리가 없습니다</p>
              </TableCell>
            </TableRow>
          ) : (
            queries.map((query) => {
              const isSelected = selectedQueryIds.includes(query.id)
              
              return (
                <QueryTableRow
                  key={query.id}
                  query={query}
                  isSelected={isSelected}
                  onSelect={onSelectQuery}
                  onQueryClick={onQueryClick}
                  onEdit={(queryId, queryText) => setEditingQuery({ id: queryId, text: queryText })}
                  onDelete={handleDeleteQuery}
                  isDeleting={deleteQueryMutation.isPending}
                  rowClassName={isSelected ? 'bg-blue-50' : ''}
                />
              )
            })
          )}
        </TableBody>
      </Table>
      </div>

      {/* 페이지네이션 정보와 설정 */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      {/* 쿼리 편집 다이얼로그 */}
      <QueryEditDialog
        editingQuery={editingQuery}
        onSave={handleUpdateQuery}
        onClose={() => setEditingQuery(null)}
        isSaving={updateQueryMutation.isPending}
      />
    </div>
  )
}

// 로딩 스켈레톤 컴포넌트
function QueryTableSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">선택</TableHead>
            <TableHead>쿼리</TableHead>
            <TableHead className="text-center w-24">문서수</TableHead>
            <TableHead className="text-center w-16">정답</TableHead>
            <TableHead className="text-center w-16">오답</TableHead>
            <TableHead className="text-center w-20">미지정</TableHead>
            <TableHead className="text-center w-24">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-4" /></TableCell>
              <TableCell><Skeleton className="h-4 w-48" /></TableCell>
              <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
              <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
              <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
              <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
              <TableCell><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
              <TableCell><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 