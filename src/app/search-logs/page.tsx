import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// 상단 입력 제거되어 미사용 import 삭제
import { searchLogApi } from "@/lib/api"
import type { 
  SearchLogItem, 
  SearchLogParams,
  SearchLogSortField, 
  SearchLogSortDirection 
} from "@/types/dashboard"
import { SearchLogHeader } from "./components/SearchLogHeader"
import { SearchLogTableRefactored } from "./components/SearchLogTableRefactored"
import { SearchLogDetailDialog } from "./components/SearchLogDetailDialog"
import { getSearchSessionId } from "@/lib/search-session"
import { PaginationControls } from "@/shared/components/PaginationControls"
import { DataTableToolbar } from "@/shared/components/DataTableToolbar"
// import { PAGINATION } from "@/constants/pagination"

export default function SearchLogs() {
  const MAX_TOTAL = 10000
  const [items, setItems] = useState<SearchLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isCapped, setIsCapped] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)
  
  // 필터 상태
  const [keyword, setKeyword] = useState("")
  const [isError, setIsError] = useState<boolean | undefined>(undefined)
  const [clientIp, setClientIp] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [minResponseTime, setMinResponseTime] = useState<number | undefined>(undefined)
  const [maxResponseTime, setMaxResponseTime] = useState<number | undefined>(undefined)
  const [minResultCount, setMinResultCount] = useState<number | undefined>(undefined)
  const [maxResultCount, setMaxResultCount] = useState<number | undefined>(undefined)
  
  // 정렬 상태
  const [sortField, setSortField] = useState<SearchLogSortField>('timestamp')
  const [sortDirection, setSortDirection] = useState<SearchLogSortDirection>('desc')
  

  // 검색 로그 목록 조회
  const fetchItems = async () => {
    setLoading(true)
    setError("")
    try {
      const sessionId = getSearchSessionId()
      const params: SearchLogParams = {
        page, // API는 0부터 시작 (state도 0-base)
        size: pageSize,
        sort: sortField,
        order: sortDirection,
        searchSessionId: sessionId,
        ...(keyword && { keyword }),
        ...(isError !== undefined && { isError }),
        ...(clientIp && { clientIp }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(minResponseTime !== undefined && { minResponseTime }),
        ...(maxResponseTime !== undefined && { maxResponseTime }),
        ...(minResultCount !== undefined && { minResultCount }),
        ...(maxResultCount !== undefined && { maxResultCount })
      }
      
      const response = await searchLogApi.getList(params)
      const serverTotal = response.totalElements || 0
      const cappedTotal = Math.min(serverTotal, MAX_TOTAL)
      const cappedTotalPages = Math.max(1, Math.ceil(cappedTotal / pageSize))

      setItems(response.content || [])
      setTotal(cappedTotal)
      setTotalPages(cappedTotalPages)
      setIsCapped(serverTotal > MAX_TOTAL)

      // 현재 페이지가 캡을 초과하면 마지막 허용 페이지로 이동
      if (page >= cappedTotalPages) {
        setPage(cappedTotalPages - 1)
      }
    } catch (err) {
      console.error('검색 로그 API 에러:', err)
      if (err instanceof Error) {
        if (err.message.includes('500') || err.message.includes('서버 내부 오류')) {
          setError("서버에서 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
        } else {
          setError(err.message)
        }
      } else {
        setError("목록 조회 중 오류가 발생했습니다.")
      }
      setItems([])
      setTotal(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  // 정렬 처리
  const handleSort = (field: SearchLogSortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    setPage(0)
  }

  // 검색 실행
  const handleSearch = () => {
    setPage(0)
    fetchItems()
  }

  // 필터 초기화
  const handleResetFilters = () => {
    setKeyword("")
    setIsError(undefined)
    setClientIp("")
    setStartDate("")
    setEndDate("")
    setMinResponseTime(undefined)
    setMaxResponseTime(undefined)
    setMinResultCount(undefined)
    setMaxResultCount(undefined)
    setPage(0)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(0) // 페이지 크기 변경시 첫 페이지(0)로 이동
  }


  // 페이지, 정렬, 페이지 크기 변경 시에만 목록 재조회
  useEffect(() => {
    fetchItems()
  }, [page, pageSize, sortField, sortDirection])

  return (
    <div className="p-1 space-y-1 bg-gray-50 min-h-screen">
      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <SearchLogHeader
            keyword={keyword}
            indexName=""
            isError={isError}
            clientIp={clientIp}
            startDate={startDate}
            endDate={endDate}
            minResponseTime={minResponseTime}
            maxResponseTime={maxResponseTime}
            minResultCount={minResultCount}
            maxResultCount={maxResultCount}
            onKeywordChange={setKeyword}
            onIndexNameChange={() => {}}
            onIsErrorChange={setIsError}
            onClientIpChange={setClientIp}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onMinResponseTimeChange={setMinResponseTime}
            onMaxResponseTimeChange={setMaxResponseTime}
            onMinResultCountChange={setMinResultCount}
            onMaxResultCountChange={setMaxResultCount}
            onSearch={handleSearch}
            onResetFilters={handleResetFilters}
          />
        </CardHeader>
        <CardContent className="px-3">
          <DataTableToolbar
            showSearch={false}
            totalCount={total}
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            leftMessage={
              isCapped ? (
                <div className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded px-2 py-1">
                  검색 결과는 상위 10,000개까지만 제공합니다. 더 깊은 데이터는 기간/필터를 좁혀 조회하세요.
                </div>
              ) : undefined
            }
          />
          {error && (
            <div className="text-red-700 text-xs mb-2 p-2 bg-red-50 rounded border border-red-200">
              {error}
            </div>
          )}

          {/* 상단 총 건수/페이지, 페이지당 선택 제거 */}

          {loading ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-xs text-gray-600">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                로딩 중...
              </div>
            </div>
          ) : (
            <>
              {/* 상단 검색 입력 제거(원래대로) */}

              <SearchLogTableRefactored
                items={items}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onRowClick={(item) => { setSelectedLogId(item.id); setDetailOpen(true) }}
              />

              {items.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <div className="mb-1 text-xs">검색 결과가 없습니다</div>
                  <div className="text-xs text-gray-400">필터 조건을 변경해서 다시 검색해보세요</div>
                </div>
              )}

              <div className="mt-3 pt-2 border-t border-gray-100">
                <PaginationControls
                  currentPage={page}
                  totalPages={totalPages}
                  totalCount={total}
                  pageSize={pageSize}
                  onPageChange={(p) => setPage(p)}
                  onPageSizeChange={(ps) => { handlePageSizeChange(ps) }}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <SearchLogDetailDialog logId={selectedLogId} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  )
} 