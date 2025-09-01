import { BaseTable, type Column } from '@/shared/components/tables'
import { AlertCircle, CheckCircle } from "lucide-react"
import { 
  formatResponseTime, 
  formatResultCount, 
  truncateText, 
  getResponseTimeColor 
} from "@/utils/table-helpers"
import { formatTimestamp as formatTimestampUtil } from "@/utils/date-helpers"
import type { SearchLogItem, SearchLogSortField, SearchLogSortDirection } from "@/types/dashboard"

interface SearchLogTableProps {
  items: SearchLogItem[]
  sortField: SearchLogSortField
  sortDirection: SearchLogSortDirection
  onSort: (field: SearchLogSortField) => void
  onRowClick?: (item: SearchLogItem) => void
}

export function SearchLogTableRefactored({
  items,
  sortField,
  sortDirection,
  onSort,
  onRowClick
}: SearchLogTableProps) {

  const columns: Column<SearchLogItem>[] = [
    {
      key: 'timestamp',
      label: '검색시간',
      width: 'w-[120px]',
      align: 'center',
      sortable: true,
      render: (item) => (
        <div className="text-xs text-muted-foreground">
          {formatTimestampUtil(item.timestamp)}
        </div>
      )
    },
    {
      key: 'searchKeyword',
      label: '검색키워드',
      width: 'min-w-[150px]',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-left" title={item.searchKeyword}>
            {item.searchKeyword || '(검색어 없음)'}
          </span>
        </div>
      )
    },
    {
      key: 'responseTime',
      label: '응답시간',
      width: 'w-[70px]',
      align: 'center',
      sortable: true,
      render: (item) => (
        <span className={`font-medium ${getResponseTimeColor(item.responseTimeMs)}`}>
          {formatResponseTime(item.responseTimeMs)}
        </span>
      )
    },
    {
      key: 'resultCount',
      label: '결과수',
      width: 'w-[60px]',
      align: 'center',
      sortable: true,
      render: (item) => (
        <span className="font-medium">
          {formatResultCount(item.resultCount)}
        </span>
      )
    },
    {
      key: 'clientIp',
      label: '클라이언트 IP',
      width: 'w-[100px]',
      align: 'center',
      render: (item) => (
        <span className="text-xs font-mono text-muted-foreground">
          {item.clientIp}
        </span>
      )
    },
    {
      key: 'isSuccess',
      label: '상태',
      width: 'w-[50px]',
      align: 'center',
      render: (item) => (
        <div className="flex justify-center">
          {!item.isError ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
        </div>
      )
    },
    {
      key: 'sessionId',
      label: '세션 ID',
      width: 'w-[120px]',
      align: 'center',
      render: (item) => (
        <span className="text-xs font-mono text-muted-foreground" title={item.searchSessionId}>
          {item.searchSessionId ? truncateText(item.searchSessionId, 15) : '-'}
        </span>
      )
    },
    {
      key: 'userAgent',
      label: 'User-Agent',
      width: 'min-w-[150px]',
      render: (item) => (
        <span className="text-xs text-muted-foreground" title={item.userAgent}>
          {truncateText(item.userAgent, 90)}
        </span>
      )
    }
  ]

  return (
    <BaseTable
      columns={columns}
      data={items}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
      onRowClick={onRowClick}
      emptyMessage="검색 로그가 없습니다."
      keyExtractor={(item) => `${item.timestamp}-${item.searchSessionId || item.id}`}
    />
  )
}