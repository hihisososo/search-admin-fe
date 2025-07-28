import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer"
import { 
  useEvaluationQueries, 
  useEvaluationDocuments
} from "@/hooks/use-evaluation"
import { QueryTable } from "../components/QueryTable"
import { DocumentTable } from "../components/DocumentTable"

export default function AnswerSetManagementPage() {
  // 상태 관리
  const [selectedQueryIds, setSelectedQueryIds] = useState<number[]>([])
  const [selectedQueryForDocuments, setSelectedQueryForDocuments] = useState<{ id: number, query: string } | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  
  // 페이지네이션 상태
  const [queryPage, setQueryPage] = useState(0)
  const [documentPage, setDocumentPage] = useState(0)
  const [queryPageSize, setQueryPageSize] = useState(20)
  const documentPageSize = 20

  // API 호출
  const queriesQuery = useEvaluationQueries({ page: queryPage, size: queryPageSize })
  const documentsQuery = useEvaluationDocuments(
    selectedQueryForDocuments?.id || null, 
    { page: documentPage, size: documentPageSize }
  )

  // 디버깅용 로그 - 쿼리 데이터 확인
  console.log('📊 queriesQuery 상태:', {
    isLoading: queriesQuery.isLoading,
    isError: queriesQuery.isError,
    error: queriesQuery.error,
    data: queriesQuery.data,
    queriesCount: queriesQuery.data?.queries?.length || 0,
    sampleQuery: queriesQuery.data?.queries?.[0] || null
  })

  // 디버깅용 로그 - 문서 데이터 확인
  console.log('📊 documentsQuery 상태:', {
    queryId: selectedQueryForDocuments?.id,
    isLoading: documentsQuery.isLoading,
    isError: documentsQuery.isError,
    error: documentsQuery.error,
    data: documentsQuery.data,
    documentsCount: documentsQuery.data?.documents?.length || 0
  })

  // 쿼리 선택 핸들러 (체크박스)
  const handleSelectQuery = (queryId: number, queryText: string, checked: boolean) => {
    console.log('📝 handleSelectQuery 호출 - queryId:', queryId, 'checked:', checked, 'current selectedQueryIds:', selectedQueryIds)
    if (checked) {
      const newSelected = [...selectedQueryIds, queryId]
      console.log('📝 새로운 선택된 쿼리들:', newSelected)
      setSelectedQueryIds(newSelected)
    } else {
      const newSelected = selectedQueryIds.filter(id => id !== queryId)
      console.log('📝 새로운 선택된 쿼리들:', newSelected)
      setSelectedQueryIds(newSelected)
    }
  }

  // 전체 선택 핸들러
  const handleSelectAll = (queryIds: number[], checked: boolean) => {
    console.log('📋 handleSelectAll 호출 - queryIds:', queryIds, 'checked:', checked, 'current selectedQueryIds:', selectedQueryIds)
    if (checked) {
      // 기존 선택된 항목에 새로운 항목들 추가 (중복 제거)
      const newSelectedIds = [...new Set([...selectedQueryIds, ...queryIds])]
      console.log('📋 새로운 선택된 쿼리들 (전체 선택):', newSelectedIds)
      setSelectedQueryIds(newSelectedIds)
    } else {
      // 해당 쿼리들만 선택 해제
      const newSelectedIds = selectedQueryIds.filter(id => !queryIds.includes(id))
      console.log('📋 새로운 선택된 쿼리들 (전체 해제):', newSelectedIds)
      setSelectedQueryIds(newSelectedIds)
    }
  }

  // 쿼리 클릭 핸들러 (문서 보기)
  const handleQueryClick = (queryId: number, queryText: string) => {
    console.log('🔍 쿼리 클릭:', { queryId, queryText })
    setSelectedQueryForDocuments({ id: queryId, query: queryText })
    setDocumentPage(0) // 새 쿼리 선택 시 문서 페이지 초기화
    setIsDrawerOpen(true)
  }

  // 선택 초기화 핸들러
  const handleClearSelection = () => {
    setSelectedQueryIds([])
  }

  // 페이지 변경 핸들러
  const handleQueryPageChange = (page: number) => {
    setQueryPage(page)
    setSelectedQueryIds([]) // 페이지 변경 시 선택 초기화
  }

  const handleDocumentPageChange = (page: number) => {
    setDocumentPage(page)
  }

  // 페이지 크기 변경 핸들러
  const handleQueryPageSizeChange = (newPageSize: number) => {
    setQueryPageSize(newPageSize)
    setQueryPage(0) // 페이지 크기 변경 시 첫 페이지로 이동
    setSelectedQueryIds([]) // 선택 초기화
  }

  // 데이터 새로고침 핸들러
  const handleRefresh = () => {
    queriesQuery.refetch()
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 쿼리 테이블 */}
        <Card>
          <CardContent className="p-0">
            <QueryTable
              queries={queriesQuery.data?.queries || []}
              selectedQueryIds={selectedQueryIds}
              onSelectQuery={handleSelectQuery}
              onSelectAll={handleSelectAll}
              onQueryClick={handleQueryClick}
              onClearSelection={handleClearSelection}
              currentPage={queriesQuery.data?.currentPage || 0}
              totalPages={queriesQuery.data?.totalPages || 1}
              totalCount={queriesQuery.data?.totalCount || 0}
              pageSize={queryPageSize}
              onPageChange={handleQueryPageChange}
              onPageSizeChange={handleQueryPageSizeChange}
              onRefresh={handleRefresh}
              isLoading={queriesQuery.isLoading}
            />
          </CardContent>
        </Card>

        {/* 문서 리스트 Drawer */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="right">
          <DrawerContent 
            className="h-full !w-[70vw] !max-w-none ml-auto fixed bottom-0 right-0 border-l shadow-2xl"
            style={{ width: '70vw', maxWidth: 'none' }}
          >
            <div className="flex-1 overflow-auto bg-white">
              {selectedQueryForDocuments && (
                <DocumentTable
                  queryId={selectedQueryForDocuments.id}
                  query={selectedQueryForDocuments.query}
                  documents={documentsQuery.data?.documents || []}
                  currentPage={documentsQuery.data?.currentPage || 0}
                  totalPages={documentsQuery.data?.totalPages || 1}
                  totalCount={documentsQuery.data?.totalCount || 0}
                  onPageChange={handleDocumentPageChange}
                  onClose={() => setIsDrawerOpen(false)}
                  isLoading={documentsQuery.isLoading}
                />
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
} 