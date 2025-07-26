import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, AlertCircle, CheckCircle } from "lucide-react"
import type { SearchLogItem, SearchLogSortField, SearchLogSortDirection } from "@/types/dashboard"

interface SearchLogTableProps {
  items: SearchLogItem[]
  sortField: SearchLogSortField
  sortDirection: SearchLogSortDirection
  onSort: (field: SearchLogSortField) => void
}

export function SearchLogTable({
  items,
  sortField,
  sortDirection,
  onSort
}: SearchLogTableProps) {

  // 정렬 아이콘 렌더링
  const renderSortIcon = (field: SearchLogSortField) => {
    if (sortField !== field) {
      return <ChevronUp className="w-3 h-3 opacity-30" />
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-3 h-3" /> : 
      <ChevronDown className="w-3 h-3" />
  }

  // 날짜 포맷팅
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // 응답시간 포맷팅
  const formatResponseTime = (ms: number) => {
    if (ms < 1000) {
      return `${ms}ms`
    }
    return `${(ms / 1000).toFixed(2)}s`
  }

  // 결과수 포맷팅
  const formatResultCount = (count: number) => {
    return count.toLocaleString('ko-KR')
  }

  // User-Agent 단축
  const truncateUserAgent = (userAgent: string) => {
    if (userAgent.length <= 30) return userAgent
    return userAgent.substring(0, 90) + "..."
  }

  // 응답시간에 따른 색상 결정
  const getResponseTimeColor = (ms: number) => {
    if (ms < 100) return "text-green-600"
    if (ms < 500) return "text-yellow-600" 
    if (ms < 1000) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader className="bg-gray-50">
          <TableRow className="h-8">
            <TableHead className="w-[120px] py-1 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort('timestamp')}
                className="h-4 p-1 font-medium hover:bg-gray-100 flex items-center justify-center gap-1 text-xs w-full"
              >
                검색시간
                {renderSortIcon('timestamp')}
              </Button>
            </TableHead>
            <TableHead className="min-w-[150px] py-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort('searchKeyword')}
                className="h-4 p-1 font-medium hover:bg-gray-100 flex items-center gap-1 text-xs"
              >
                검색키워드
                {renderSortIcon('searchKeyword')}
              </Button>
            </TableHead>
            <TableHead className="w-[70px] py-1 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort('responseTime')}
                className="h-4 p-1 font-medium hover:bg-gray-100 flex items-center justify-center gap-1 text-xs w-full"
              >
                응답시간
                {renderSortIcon('responseTime')}
              </Button>
            </TableHead>
            <TableHead className="w-[60px] py-1 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort('resultCount')}
                className="h-4 p-1 font-medium hover:bg-gray-100 flex items-center justify-center gap-1 text-xs w-full"
              >
                결과수
                {renderSortIcon('resultCount')}
              </Button>
            </TableHead>
            <TableHead className="w-[100px] py-1 text-xs text-center">클라이언트 IP</TableHead>
            <TableHead className="w-[50px] py-1 text-xs text-center">상태</TableHead>
            <TableHead className="min-w-[150px] py-1 text-xs">User-Agent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-gray-50 h-8">
              <TableCell className="text-xs text-gray-600 py-1 text-center">
                {formatTimestamp(item.timestamp)}
              </TableCell>
              <TableCell className="font-medium py-1">
                <div className="max-w-[200px] truncate text-xs" title={item.searchKeyword}>
                  {item.searchKeyword}
                </div>
              </TableCell>
              <TableCell className={`text-xs font-medium py-1 text-center ${getResponseTimeColor(item.responseTimeMs)}`}>
                {formatResponseTime(item.responseTimeMs)}
              </TableCell>
              <TableCell className="text-xs py-1 text-center">
                {formatResultCount(item.resultCount)}
              </TableCell>
              <TableCell className="text-xs text-gray-600 py-1 text-center">
                {item.clientIp}
              </TableCell>
              <TableCell className="py-1">
                <div className="flex items-center justify-center gap-1">
                  {item.isError ? (
                    <>
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <Badge variant="destructive" className="text-xs px-1 py-0">
                        에러
                      </Badge>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        정상
                      </Badge>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-xs text-gray-500 py-1 max-w-[300px]">
                <div title={item.userAgent} className="truncate">
                  {truncateUserAgent(item.userAgent)}
                </div>
                {item.isError && item.errorMessage && (
                  <div className="mt-1 text-red-600 text-xs truncate" title={item.errorMessage}>
                    {item.errorMessage.length > 100 ? item.errorMessage.substring(0, 100) + "..." : item.errorMessage}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 