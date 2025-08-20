import { useState } from "react"
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronRight } from "lucide-react"
import { EVALUATION_CONFIG } from "@/constants/evaluation"
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
              <div className="text-2xl font-bold text-green-600">{(report.averageNdcg20 || report.averageNdcg || 0).toFixed(3)}</div>
              <div className="text-sm text-gray-600">nDCG@20</div>
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

  React.useEffect(() => {
    console.log(`[QueryDetailsView] 렌더링 완료: ${(performance.now() - componentStartTime).toFixed(2)}ms`)
  })

  return (
    <div className="space-y-2">
      {queryDetails.map((detail: any, index: number) => {
        if (index === 0) {
          console.log(`[QueryDetailsView] 첫 번째 쿼리 렌더링 시작: ${detail.query}`)
        } else if (index === queryDetails.length - 1) {
          console.log(`[QueryDetailsView] 마지막 쿼리 렌더링: ${detail.query}`)
        }
        const expanded = !!expandedMap[index]
        
        
        return (
          <div key={index} className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleRow(index)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{detail.query}</div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {detail.ndcgAt20 !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      detail.ndcgAt20 >= 0.8 ? 'bg-green-100 text-green-700' :
                      detail.ndcgAt20 >= 0.6 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      nDCG: {detail.ndcgAt20.toFixed(3)}
                    </span>
                  )}
                  {detail.recallAt300 !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      detail.recallAt300 >= 0.8 ? 'bg-green-100 text-green-700' :
                      detail.recallAt300 >= 0.6 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      Recall: {(detail.recallAt300 * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2">
                {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
            </button>
            {expanded && (
              <div className="p-3 border-t space-y-4">
                <div className="flex flex-wrap items-center justify-end gap-3 text-[11px] text-gray-600">
                  <div>관련: {detail.relevantCount}</div>
                  <div>검색: {detail.retrievedCount}</div>
                  <div>정답: {detail.correctCount}</div>
                </div>


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
            )}
          </div>
        )
      })}
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
                        <span className="font-mono text-[11px] bg-white/70 px-1 py-0.5 rounded border">{productId}</span>
                      ) : (
                        <span className="text-[11px] text-gray-400">-</span>
                      )}
                    </div>
                    <div className="col-span-5">
                      {productName ? (
                        <div className={expanded ? "whitespace-pre-wrap break-all" : "truncate"}>{productName}</div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                    <div className="col-span-5">
                      {productSpecs ? (
                        <div className={expanded ? "whitespace-pre-wrap break-all" : "truncate"}>{productSpecs}</div>
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
                <div className="whitespace-pre-wrap break-all text-xs">{String(doc)}</div>
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