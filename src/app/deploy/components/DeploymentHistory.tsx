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
import type { DeployHistory } from '@/types/deploy'

interface DeploymentHistoryProps {
  history: DeployHistory[]
}

type SortField = 'deploymentTime' | 'status' | 'version' | 'documentCount' | 'deploymentType'
type SortDirection = 'asc' | 'desc'

export default function DeploymentHistory({ history = [] }: DeploymentHistoryProps) {
  const [sortField, setSortField] = useState<SortField>('deploymentTime')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(15)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num)
  }

  const getStatusIcon = (status: DeployHistory['status']) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-3 w-3 text-gray-600" />
      case 'FAILED':
        return <XCircle className="h-3 w-3 text-gray-600" />
      case 'IN_PROGRESS':
        return <Clock className="h-3 w-3 text-gray-600 animate-pulse" />
      default:
        return <Clock className="h-3 w-3 text-gray-400" />
    }
  }

  const getStatusColor = (status: DeployHistory['status']) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-gray-700'
      case 'FAILED':
        return 'text-gray-700'
      case 'IN_PROGRESS':
        return 'text-gray-700'
      default:
        return 'text-gray-500'
    }
  }

  const getTypeIcon = (type: DeployHistory['deploymentType']) => {
    switch (type) {
      case 'INDEXING':
        return <RefreshCw className="h-3 w-3 text-gray-600" />
      case 'DEPLOYMENT':
        return <Rocket className="h-3 w-3 text-gray-600" />
      default:
        return <Clock className="h-3 w-3 text-gray-400" />
    }
  }

  // 정렬된 데이터
  const sortedData = useMemo(() => {
    return [...history].sort((a, b) => {
      let aValue, bValue
      
      switch (sortField) {
        case 'deploymentTime':
          aValue = a.deploymentTime ? new Date(a.deploymentTime).getTime() : new Date(a.createdAt).getTime()
          bValue = b.deploymentTime ? new Date(b.deploymentTime).getTime() : new Date(b.createdAt).getTime()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'version':
          aValue = a.version
          bValue = b.version
          break
        case 'documentCount':
          aValue = a.documentCount
          bValue = b.documentCount
          break
        case 'deploymentType':
          aValue = a.deploymentType
          bValue = b.deploymentType
          break
        default:
          return 0
      }

      if (aValue === null || bValue === null) return 0
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [history, sortField, sortDirection])

  // 페이징된 데이터
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
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 select-none py-2 text-xs font-semibold text-gray-700"
                  onClick={() => handleSort('deploymentType')}
                >
                  <div className="flex items-center gap-1">
                    유형
                    {getSortIcon('deploymentType')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 select-none py-2 text-xs font-semibold text-gray-700"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    상태
                    {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 select-none py-2 text-xs font-semibold text-gray-700"
                  onClick={() => handleSort('version')}
                >
                  <div className="flex items-center gap-1">
                    버전
                    {getSortIcon('version')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 select-none py-2 text-xs font-semibold text-gray-700"
                  onClick={() => handleSort('documentCount')}
                >
                  <div className="flex items-center gap-1">
                    문서 수
                    {getSortIcon('documentCount')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 select-none py-2 text-xs font-semibold text-gray-700"
                  onClick={() => handleSort('deploymentTime')}
                >
                  <div className="flex items-center gap-1">
                    배포 시간
                    {getSortIcon('deploymentTime')}
                  </div>
                </TableHead>
                <TableHead className="py-2 text-xs font-semibold text-gray-700">설명</TableHead>
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
                        <span className={`text-xs font-medium ${getStatusColor(deploy.status)}`}>
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
        
        {/* 페이징 네비게이션 */}
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
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
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
                  )
                })}
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