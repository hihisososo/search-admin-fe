import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { searchLogApi } from "@/lib/api"
import type { 
  SearchLogItem, 
  SearchLogParams,
  SearchLogSortField, 
  SearchLogSortDirection 
} from "@/types/dashboard"
import { SearchLogHeader } from "./components/SearchLogHeader"
import { SearchLogTable } from "./components/SearchLogTable"
import { SearchLogDetailDialog } from "./components/SearchLogDetailDialog"
import { getSearchSessionId } from "@/lib/search-session"
import { PaginationControls } from "@/components/common/PaginationControls"
import { PAGINATION } from "@/constants/pagination"

export default function SearchLogs() {
  const [items, setItems] = useState<SearchLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
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
        page: page - 1, // API는 0부터 시작
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
      setItems(response.content || [])
      setTotal(response.totalElements || 0)
      setTotalPages(response.totalPages || 0)
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
    setPage(1)
  }

  // 검색 실행
  const handleSearch = () => {
    setPage(1)
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
    setPage(1)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // 페이지 크기 변경시 첫 페이지로 이동
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
          {error && (
            <div className="text-red-700 text-xs mb-2 p-2 bg-red-50 rounded border border-red-200">
              {error}
            </div>
          )}

          {/* 전체 건수 및 페이지 크기 선택 */}
              <div className="flex justify-between items-center mb-1">
            <div className="text-xs text-gray-500">
              전체 {total.toLocaleString()}건 (페이지 {page}/{totalPages})
            </div>
            <div className="flex items-center gap-2">
              <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                <SelectTrigger className="w-20 h-6 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                      {PAGINATION.AVAILABLE_PAGE_SIZES.map(size => (
                        <SelectItem key={size} value={size.toString()} className="text-xs py-1">
                          {size}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-xs text-gray-600">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                로딩 중...
              </div>
            </div>
          ) : (
            <>
              <SearchLogTable
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
                  currentPage={page - 1}
                  totalPages={totalPages}
                  totalCount={total}
                  pageSize={pageSize}
                  onPageChange={(p) => setPage(p + 1)}
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