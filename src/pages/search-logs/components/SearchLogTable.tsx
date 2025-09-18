import { AlertCircle, CheckCircle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatResponseTime,
  formatResultCount,
  truncateText,
  getResponseTimeColor,
  renderSortIcon
} from "@/utils/table-helpers"
import { formatTimestamp as formatTimestampUtil } from "@/utils/date-helpers"
import type { SearchLogItem, SearchLogSortField, SearchLogSortDirection } from "@/services/search-logs/types"

interface SearchLogTableProps {
  items: SearchLogItem[]
  sortField: SearchLogSortField
  sortDirection: SearchLogSortDirection
  onSort: (field: SearchLogSortField) => void
  onRowClick?: (item: SearchLogItem) => void
}

export function SearchLogTable({
  items,
  sortField,
  sortDirection,
  onSort,
  onRowClick
}: SearchLogTableProps) {

  const handleHeaderClick = (field: SearchLogSortField) => {
    if (onSort) {
      onSort(field)
    }
  }

  const sortableFields = ['timestamp', 'searchKeyword', 'responseTime', 'resultCount'] as const
  const isSortable = (field: string): field is typeof sortableFields[number] => {
    return sortableFields.includes(field as typeof sortableFields[number])
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">검색 로그가 없습니다</div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead
              className={`py-2 text-xs font-semibold text-gray-700 text-center w-[120px] ${isSortable('timestamp') ? 'cursor-pointer hover:bg-gray-100' : ''}`}
              onClick={() => handleHeaderClick('timestamp' as SearchLogSortField)}
            >
              <div className="flex items-center gap-1 justify-center">
                검색시간
                {isSortable('timestamp') && renderSortIcon('timestamp', sortField, sortDirection)}
              </div>
            </TableHead>
            <TableHead
              className={`py-2 text-xs font-semibold text-gray-700 text-left min-w-[150px] ${isSortable('searchKeyword') ? 'cursor-pointer hover:bg-gray-100' : ''}`}
              onClick={() => handleHeaderClick('searchKeyword' as SearchLogSortField)}
            >
              <div className="flex items-center gap-1">
                검색키워드
                {isSortable('searchKeyword') && renderSortIcon('searchKeyword', sortField, sortDirection)}
              </div>
            </TableHead>
            <TableHead
              className={`py-2 text-xs font-semibold text-gray-700 text-center w-[70px] ${isSortable('responseTime') ? 'cursor-pointer hover:bg-gray-100' : ''}`}
              onClick={() => handleHeaderClick('responseTime' as SearchLogSortField)}
            >
              <div className="flex items-center gap-1 justify-center">
                응답시간
                {isSortable('responseTime') && renderSortIcon('responseTime', sortField, sortDirection)}
              </div>
            </TableHead>
            <TableHead
              className={`py-2 text-xs font-semibold text-gray-700 text-center w-[60px] ${isSortable('resultCount') ? 'cursor-pointer hover:bg-gray-100' : ''}`}
              onClick={() => handleHeaderClick('resultCount' as SearchLogSortField)}
            >
              <div className="flex items-center gap-1 justify-center">
                결과수
                {isSortable('resultCount') && renderSortIcon('resultCount', sortField, sortDirection)}
              </div>
            </TableHead>
            <TableHead className="py-2 text-xs font-semibold text-gray-700 text-center w-[100px]">
              클라이언트 IP
            </TableHead>
            <TableHead className="py-2 text-xs font-semibold text-gray-700 text-center w-[50px]">
              상태
            </TableHead>
            <TableHead className="py-2 text-xs font-semibold text-gray-700 text-center w-[120px]">
              세션 ID
            </TableHead>
            <TableHead className="py-2 text-xs font-semibold text-gray-700 text-left min-w-[150px]">
              User-Agent
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const itemKey = `${item.timestamp}-${item.searchSessionId || item.id}`
            return (
              <TableRow
                key={itemKey}
                className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(item)}
              >
                <TableCell className="py-2 px-3 text-xs text-center">
                  <div className="text-xs text-muted-foreground">
                    {formatTimestampUtil(item.timestamp)}
                  </div>
                </TableCell>
                <TableCell className="py-2 px-3 text-xs text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-left" title={item.searchKeyword}>
                      {item.searchKeyword || '(검색어 없음)'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-2 px-3 text-xs text-center">
                  <span className={`font-medium ${getResponseTimeColor(item.responseTimeMs)}`}>
                    {formatResponseTime(item.responseTimeMs)}
                  </span>
                </TableCell>
                <TableCell className="py-2 px-3 text-xs text-center">
                  <span className="font-medium">
                    {formatResultCount(item.resultCount)}
                  </span>
                </TableCell>
                <TableCell className="py-2 px-3 text-xs text-center">
                  <span className="text-xs font-mono text-muted-foreground">
                    {item.clientIp}
                  </span>
                </TableCell>
                <TableCell className="py-2 px-3 text-xs text-center">
                  <div className="flex justify-center">
                    {!item.isError ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-2 px-3 text-xs text-center">
                  <span className="text-xs font-mono text-muted-foreground" title={item.searchSessionId}>
                    {item.searchSessionId ? truncateText(item.searchSessionId, 15) : '-'}
                  </span>
                </TableCell>
                <TableCell className="py-2 px-3 text-xs text-left">
                  <span className="text-xs text-muted-foreground" title={item.userAgent}>
                    {truncateText(item.userAgent, 90)}
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}