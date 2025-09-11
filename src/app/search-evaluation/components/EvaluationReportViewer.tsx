import { useState } from "react"
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { EVALUATION_CONFIG } from "@/constants/evaluation"
import { PaginationControls } from "./PaginationControls"
import type { EvaluationReport } from "@/services/evaluation/types"

interface EvaluationReportViewerProps {
  report: EvaluationReport
}

export function EvaluationReportViewer({ report }: EvaluationReportViewerProps) {
  const queryDetails = report.queryDetails || []
  
  console.log('[EvaluationReportViewer] 렌더링 시작', {
    reportId: report.id,
    queryDetailsCount: queryDetails.length,
    totalQueries: report.totalQueries
  })
  
  const renderStartTime = performance.now()
  
  React.useEffect(() => {
    console.log(`[EvaluationReportViewer] 렌더링 완료: ${(performance.now() - renderStartTime).toFixed(2)}ms`)
  })

  return (
    <div className="space-y-6">

      {/* 통계 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">평가 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{report.totalQueries}</div>
              <div className="text-sm text-gray-600">총 쿼리</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{(report.averagePrecision20 || report.averagePrecision || 0).toFixed(3)}</div>
              <div className="text-sm text-gray-600">Precision@20</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{(report.averageRecall300 || report.averageRecall || 0).toFixed(3)}</div>
              <div className="text-sm text-gray-600">Recall@300</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 쿼리별 상세 결과 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">쿼리별 성능 분석</CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(queryDetails) && queryDetails.length > 0 ? (
            <QueryDetailsView queryDetails={queryDetails} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              쿼리별 상세 데이터가 없습니다.
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}

function QueryDetailsView({ queryDetails }: { queryDetails: any[] }) {
  const [expandedMap, setExpandedMap] = useState<Record<number, boolean>>({})
  const [currentPage, setCurrentPage] = useState(0) // 0-based for consistency
  const [pageSize, setPageSize] = useState(10)
  const [sortField, setSortField] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  console.log('[QueryDetailsView] 렌더링 시작', {
    queryDetailsCount: queryDetails.length,
    firstQuery: queryDetails[0]?.query,
    firstQueryMissingCount: queryDetails[0]?.missingDocuments?.length || 0,
    firstQueryWrongCount: queryDetails[0]?.wrongDocuments?.length || 0
  })
  
  const componentStartTime = performance.now()

  const toggleRow = (index: number) => {
    console.log(`[QueryDetailsView] 토글 행: ${index}`)
    setExpandedMap((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  // 정렬 핸들러
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(0) // 정렬 시 첫 페이지로
  }

  // 정렬된 데이터
  const sortedDetails = React.useMemo(() => {
    if (!sortField) return queryDetails
    
    return [...queryDetails].sort((a, b) => {
      let aValue: any
      let bValue: any
      
      switch(sortField) {
        case 'query':
          aValue = a.query || ''
          bValue = b.query || ''
          break
        case 'precisionAt20':
          aValue = a.precisionAt20 || 0
          bValue = b.precisionAt20 || 0
          break
        case 'recallAt300':
          aValue = a.recallAt300 || 0
          bValue = b.recallAt300 || 0
          break
        case 'relevantCount':
          aValue = a.relevantCount || 0
          bValue = b.relevantCount || 0
          break
        case 'retrievedCount':
          aValue = a.retrievedCount || 0
          bValue = b.retrievedCount || 0
          break
        case 'correctCount':
          aValue = a.correctCount || 0
          bValue = b.correctCount || 0
          break
        case 'missingCount':
          aValue = a.missingDocuments?.length || 0
          bValue = b.missingDocuments?.length || 0
          break
        case 'wrongCount':
          aValue = a.wrongDocuments?.length || 0
          bValue = b.wrongDocuments?.length || 0
          break
        default:
          return 0
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      return sortDirection === 'asc' 
        ? aValue - bValue
        : bValue - aValue
    })
  }, [queryDetails, sortField, sortDirection])

  // 페이지네이션 계산
  const totalPages = Math.ceil(sortedDetails.length / pageSize)
  const startIndex = currentPage * pageSize
  const endIndex = startIndex + pageSize
  const currentItems = sortedDetails.slice(startIndex, endIndex)
  const totalCount = sortedDetails.length

  React.useEffect(() => {
    console.log(`[QueryDetailsView] 렌더링 완료: ${(performance.now() - componentStartTime).toFixed(2)}ms`)
  })

  return (
    <div className="space-y-3">
      {/* 페이지 정보 및 크기 선택 */}
      <div className="flex justify-between items-center">
        <div className="flex-1"></div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500">
            전체 {Number(totalCount || 0).toLocaleString()}건 (페이지 {currentPage + 1}/{Math.max(totalPages || 1, 1)})
          </div>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value))
              setCurrentPage(0) // Reset to first page
            }}
          >
            <SelectTrigger className="w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="10" className="text-xs py-1">10</SelectItem>
              <SelectItem value="20" className="text-xs py-1">20</SelectItem>
              <SelectItem value="50" className="text-xs py-1">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 데이터 테이블 */}
      <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead 
                className="py-2 text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('query')}
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
                onClick={() => handleSort('precisionAt20')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Precision@20</span>
                  {sortField === 'precisionAt20' && (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                  )}
                  {sortField !== 'precisionAt20' && <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                </div>
              </TableHead>
              <TableHead 
                className="py-2 text-xs font-semibold text-gray-700 text-center w-24 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('recallAt300')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Recall@300</span>
                  {sortField === 'recallAt300' && (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                  )}
                  {sortField !== 'recallAt300' && <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                </div>
              </TableHead>
              <TableHead 
                className="py-2 text-xs font-semibold text-gray-700 text-center w-20 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('relevantCount')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>관련</span>
                  {sortField === 'relevantCount' && (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                  )}
                  {sortField !== 'relevantCount' && <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                </div>
              </TableHead>
              <TableHead 
                className="py-2 text-xs font-semibold text-gray-700 text-center w-20 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('retrievedCount')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>검색</span>
                  {sortField === 'retrievedCount' && (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                  )}
                  {sortField !== 'retrievedCount' && <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                </div>
              </TableHead>
              <TableHead 
                className="py-2 text-xs font-semibold text-gray-700 text-center w-20 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('correctCount')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>정답</span>
                  {sortField === 'correctCount' && (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                  )}
                  {sortField !== 'correctCount' && <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                </div>
              </TableHead>
              <TableHead 
                className="py-2 text-xs font-semibold text-gray-700 text-center w-24 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('missingCount')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>누락</span>
                  {sortField === 'missingCount' && (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                  )}
                  {sortField !== 'missingCount' && <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                </div>
              </TableHead>
              <TableHead 
                className="py-2 text-xs font-semibold text-gray-700 text-center w-24 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('wrongCount')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>오답</span>
                  {sortField === 'wrongCount' && (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                  )}
                  {sortField !== 'wrongCount' && <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                </div>
              </TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  <p className="text-sm">쿼리별 상세 데이터가 없습니다.</p>
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((detail: any, idx: number) => {
                const actualIndex = startIndex + idx
                const expanded = !!expandedMap[actualIndex]
                
                return (
                  <React.Fragment key={actualIndex}>
                    <TableRow 
                      className={`hover:bg-gray-50 cursor-pointer ${expanded ? 'bg-blue-50' : ''}`}
                      onClick={() => toggleRow(actualIndex)}
                    >
                      <TableCell className="py-2 text-xs font-medium select-text">{detail.query}</TableCell>
                      <TableCell className="py-2 text-center">
                        <Badge 
                          variant="outline"
                          className={`text-xs ${
                            detail.precisionAt20 >= 0.8 ? 'bg-green-50 text-green-700 border-green-200' :
                            detail.precisionAt20 >= 0.6 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {(detail.precisionAt20 || 0).toFixed(3)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        <Badge 
                          variant="outline"
                          className={`text-xs ${
                            detail.recallAt300 >= 0.8 ? 'bg-green-50 text-green-700 border-green-200' :
                            detail.recallAt300 >= 0.6 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {`${((detail.recallAt300 || 0) * 100).toFixed(1)}%`}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-center text-xs">{detail.relevantCount || 0}</TableCell>
                      <TableCell className="py-2 text-center text-xs">{detail.retrievedCount || 0}</TableCell>
                      <TableCell className="py-2 text-center text-xs">{detail.correctCount || 0}</TableCell>
                      <TableCell className="py-2 text-center">
                        <Badge variant="secondary" className="text-xs">
                          {detail.missingDocuments?.length || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        <Badge variant="secondary" className="text-xs">
                          {detail.wrongDocuments?.length || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </TableCell>
                    </TableRow>
                    
                    {expanded && (
                      <TableRow>
                        <TableCell colSpan={9} className="p-0">
                          <div className="bg-gray-50 border-t p-4 space-y-4">
                            {/* 누락/오답 영역 */}
                            {(detail.missingDocuments?.length > 0 || detail.wrongDocuments?.length > 0) ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                {detail.missingDocuments?.length > 0 && (
                                  <DocumentList 
                                    documents={detail.missingDocuments}
                                    title="정답 누락"
                                    subtitle="실제 정답인데 검색 결과에 없음"
                                    bgColor="bg-red-50"
                                    textColor="text-red-800"
                                    subTextColor="text-red-600"
                                    moreTextColor="text-red-500"
                                    showAllDocs={true}
                                  />
                                )}
                                {detail.wrongDocuments?.length > 0 && (
                                  <DocumentList 
                                    documents={detail.wrongDocuments}
                                    title="오답 포함"
                                    subtitle="검색 결과에 포함되었으나 정답이 아님"
                                    bgColor="bg-yellow-50"
                                    textColor="text-yellow-800"
                                    subTextColor="text-yellow-600"
                                    moreTextColor="text-yellow-500"
                                    showAllDocs={true}
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500">이슈 문서가 없습니다.</div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize: number) => {
            setPageSize(newSize)
            setCurrentPage(0)
          }}
        />
      )}
    </div>
  )
}

// removed old QueryDetailCard in favor of clickable rows with expand/collapse

type ReportDoc = string | { productId: string; productName: string | null; productSpecs: string | null }

function DocumentList({ 
  documents, 
  title, 
  subtitle,
  bgColor, 
  textColor, 
  subTextColor, 
  moreTextColor,
  showAllDocs = false
}: {
  documents: ReportDoc[]
  title: string
  subtitle?: string
  bgColor: string
  textColor: string
  subTextColor: string
  moreTextColor: string
  showAllDocs?: boolean
}) {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})
  const maxDisplayed = EVALUATION_CONFIG.MAX_DISPLAYED_MISSING_DOCS
  const displayedDocs = showAllDocs ? documents : documents.slice(0, maxDisplayed)
  const remainingCount = showAllDocs ? 0 : (documents.length - maxDisplayed)

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const parseDocString = (raw: string): { productId?: string; productName?: string; productSpecs?: string } => {
    // 예상 포맷: "{id} {name} | {specs}" 또는 임의 문자열
    const match = raw.match(/^(\S+)\s+(.*?)\s*\|\s*(.*)$/)
    if (match) {
      return { productId: match[1], productName: match[2], productSpecs: match[3] }
    }
    return { productName: raw }
  }

  return (
    <div className={`${bgColor} p-2 rounded`}>
      <div className={`${textColor} font-medium mb-1`}>
        {title} ({documents.length})
      </div>
      {subtitle && (
        <div className="text-[11px] text-gray-600 mb-1">{subtitle}</div>
      )}
      <div className="text-[11px] text-gray-600 mb-1 grid grid-cols-12 gap-2 px-1">
        <div className="col-span-2">상품ID</div>
        <div className="col-span-5">상품명</div>
        <div className="col-span-5">스펙</div>
      </div>
      <div className={`${subTextColor} divide-y max-h-64 overflow-y-auto`}>
        {displayedDocs.map((doc: ReportDoc, i: number) => {
          const parsed = typeof doc === 'string' ? parseDocString(doc) : doc
          const productId = (parsed as any)?.productId
          const productName = (parsed as any)?.productName
          const productSpecs = (parsed as any)?.productSpecs
          const expanded = !!expandedRows[i]
          const hasStructured = productId || productName || productSpecs
          return (
            <div key={i} className="py-1 px-1">
              {hasStructured ? (
                <>
                  <div className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-2">
                      {productId ? (
                        <span className="font-mono text-[11px] bg-white/70 px-1 py-0.5 rounded border select-text">{productId}</span>
                      ) : (
                        <span className="text-[11px] text-gray-400">-</span>
                      )}
                    </div>
                    <div className="col-span-5">
                      {productName ? (
                        <div className={expanded ? "whitespace-pre-wrap break-all select-text" : "truncate select-text"}>{productName}</div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                    <div className="col-span-5">
                      {productSpecs ? (
                        <div className={expanded ? "whitespace-pre-wrap break-all select-text" : "truncate select-text"}>{productSpecs}</div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </div>
                  {(productName || productSpecs) && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => toggleRow(i)}
                        className="mt-0.5 text-[11px] underline text-gray-600 hover:text-gray-800"
                      >
                        {expanded ? '접기' : '펼치기'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="whitespace-pre-wrap break-all text-xs select-text">{String(doc)}</div>
              )}
            </div>
          )
        })}
        {remainingCount > 0 && (
          <div className={`px-1 py-1 ${moreTextColor}`}>
            +{remainingCount}개 더
          </div>
        )}
      </div>
    </div>
  )
}

// (구 파싱 오류 뷰 제거됨)