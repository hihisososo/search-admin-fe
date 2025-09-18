import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  History,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Rocket
} from 'lucide-react'
import type { DeployHistory } from '@/services/deployment/types'

interface DeploymentHistoryProps {
  history: DeployHistory[]
}

type SortField = 'deploymentTime' | 'status' | 'version' | 'documentCount' | 'deploymentType'
type SortDirection = 'asc' | 'desc'

const STATUS_CONFIG = {
  SUCCESS: { icon: CheckCircle, animate: '' },
  FAILED: { icon: XCircle, animate: '' },
  IN_PROGRESS: { icon: Clock, animate: 'animate-pulse' }
} as const

const TYPE_CONFIG = {
  INDEXING: { icon: RefreshCw },
  DEPLOYMENT: { icon: Rocket }
} as const

const COLUMNS = [
  { key: 'deploymentType' as SortField, label: '유형', sortable: true },
  { key: 'status' as SortField, label: '상태', sortable: true },
  { key: 'version' as SortField, label: '버전', sortable: true },
  { key: 'documentCount' as SortField, label: '문서 수', sortable: true },
  { key: 'deploymentTime' as SortField, label: '배포 시간', sortable: true },
  { key: 'description', label: '설명', sortable: false }
]

const getPageNumbers = (current: number, total: number): number[] => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, 4, 5]
  if (current >= total - 2) return Array.from({ length: 5 }, (_, i) => total - 4 + i)
  return [current - 2, current - 1, current, current + 1, current + 2]
}

export default function DeploymentHistory({ history = [] }: DeploymentHistoryProps) {
  const [sortField, setSortField] = useState<SortField>('deploymentTime')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(15)

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))

  const formatNumber = (num: number) =>
    new Intl.NumberFormat('ko-KR').format(num)

  const getStatusIcon = (status: DeployHistory['status']) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
    if (!config) return <Clock className="h-3 w-3 text-gray-400" />
    const Icon = config.icon
    return <Icon className={`h-3 w-3 text-gray-600 ${config.animate}`} />
  }

  const getTypeIcon = (type: DeployHistory['deploymentType']) => {
    const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG]
    if (!config) return <Clock className="h-3 w-3 text-gray-400" />
    const Icon = config.icon
    return <Icon className="h-3 w-3 text-gray-600" />
  }

  const getValue = (item: DeployHistory, field: SortField) => {
    if (field === 'deploymentTime') {
      return new Date(item.deploymentTime || item.createdAt).getTime()
    }
    return item[field]
  }

  const sortedData = useMemo(() => {
    return [...history].sort((a, b) => {
      const aValue = getValue(a, sortField)
      const bValue = getValue(b, sortField)

      if (aValue === null || bValue === null) return 0
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [history, sortField, sortDirection])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedData.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedData, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    setCurrentPage(1)
  }

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return <ChevronUp className="h-3 w-3 opacity-20" />
    return sortDirection === 'asc' ?
      <ChevronUp className="h-3 w-3 text-gray-600" /> :
      <ChevronDown className="h-3 w-3 text-gray-600" />
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4 text-gray-600" />
          색인/배포 이력
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                {COLUMNS.map((column) => (
                  <TableHead
                    key={column.key}
                    className={`py-2 text-xs font-semibold text-gray-700 ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                    }`}
                    onClick={column.sortable ? () => handleSort(column.key as SortField) : undefined}
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {column.sortable && getSortIcon(column.key as SortField)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500 text-sm">
                    색인/배포 이력이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((deploy) => (
                  <TableRow key={deploy.id} className="hover:bg-gray-50">
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1.5">
                        {getTypeIcon(deploy.deploymentType)}
                        <span className="text-xs font-medium text-gray-700">
                          {deploy.deploymentTypeDescription}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(deploy.status)}
                        <span className="text-xs font-medium text-gray-700">
                          {deploy.statusDescription}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <code className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono">
                        {deploy.version}
                      </code>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 py-2">
                      {deploy.documentCount ? formatNumber(deploy.documentCount) : '-'}
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{formatDate(deploy.deploymentTime || deploy.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="max-w-xs">
                        <span className="text-xs text-gray-500">
                          {deploy.description || '-'}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-gray-500">
              총 {sortedData.length}개 중 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, sortedData.length)}개
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="h-7 w-7 p-0 border-gray-300"
              >
                <ChevronsLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-7 w-7 p-0 border-gray-300"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>

              <div className="flex items-center gap-0.5">
                {getPageNumbers(currentPage, totalPages).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className={`w-7 h-7 p-0 text-xs ${
                      pageNum === currentPage
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-7 w-7 p-0 border-gray-300"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-7 w-7 p-0 border-gray-300"
              >
                <ChevronsRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}