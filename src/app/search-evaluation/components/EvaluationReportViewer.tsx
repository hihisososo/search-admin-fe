import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/utils/evaluation-helpers"
import { EVALUATION_CONFIG } from "@/constants/evaluation"
import { PerformanceScore } from "./PerformanceScore"
import type { EvaluationReport } from "@/services/evaluation/types"

interface EvaluationReportViewerProps {
  report: EvaluationReport
}

export function EvaluationReportViewer({ report }: EvaluationReportViewerProps) {
  const queryDetails = report.queryDetails || []

  return (
    <div className="space-y-6">
      {/* 전체 성능 지표 */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <PerformanceScore 
              score={report.averagePrecision} 
              label="Precision"
              size="lg"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <PerformanceScore 
              score={report.averageRecall} 
              label="Recall"
              size="lg"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <PerformanceScore 
              score={report.averageF1Score} 
              label="F1 Score"
              size="lg"
            />
          </CardContent>
        </Card>
      </div>

      {/* 통계 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">평가 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{report.totalQueries}</div>
              <div className="text-sm text-gray-600">총 쿼리</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{report.totalRelevantDocuments}</div>
              <div className="text-sm text-gray-600">관련 문서</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{report.totalRetrievedDocuments}</div>
              <div className="text-sm text-gray-600">검색된 문서</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{report.totalCorrectDocuments}</div>
              <div className="text-sm text-gray-600">정답 문서</div>
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

      {/* 생성 정보 */}
      <div className="text-sm text-gray-600 border-t pt-4">
        <div className="flex justify-between">
          <span>생성 시간:</span>
          <span>{formatDate(report.createdAt)}</span>
        </div>
      </div>
    </div>
  )
}

function QueryDetailsView({ queryDetails }: { queryDetails: any[] }) {
  const [expandedMap, setExpandedMap] = useState<Record<number, boolean>>({})

  const toggleRow = (index: number) => {
    setExpandedMap((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <div className="space-y-2">
      {queryDetails.map((detail: any, index: number) => {
        const expanded = !!expandedMap[index]
        return (
          <div key={index} className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleRow(index)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
            >
              <div className="text-sm font-semibold text-gray-900 truncate pr-3">{detail.query}</div>
              <div className="flex items-center gap-3">
                <PerformanceScore 
                  score={detail.precision} 
                  label="P" 
                  size="sm"
                  showPercentage={true}
                />
                <PerformanceScore 
                  score={detail.recall} 
                  label="R" 
                  size="sm"
                  showPercentage={true}
                />
              </div>
            </button>
            {expanded && (
              <div className="p-3 border-t space-y-3">
                <div className="flex items-center justify-end gap-4 text-xs text-gray-600">
                  <div>관련: {detail.relevantCount}</div>
                  <div>검색: {detail.retrievedCount}</div>
                  <div>정답: {detail.correctCount}</div>
                </div>
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
      <div className={`${subTextColor} divide-y`}>
        {displayedDocs.map((doc: ReportDoc, i: number) => {
          const parsed = typeof doc === 'string' ? parseDocString(doc) : doc
          const productId = (parsed as any)?.productId
          const productName = (parsed as any)?.productName
          const productSpecs = (parsed as any)?.productSpecs
          const expanded = !!expandedRows[i]
          const hasStructured = productId || productName || productSpecs
          return (
            <div key={i} className="grid grid-cols-12 gap-2 py-1 px-1 items-start">
              {hasStructured ? (
                <>
                  <div className="col-span-2">
                    {productId ? (
                      <span className="font-mono text-[11px] bg-white/70 px-1 py-0.5 rounded border">{productId}</span>
                    ) : (
                      <span className="text-[11px] text-gray-400">-</span>
                    )}
                  </div>
                  <div className="col-span-5">
                    {productName ? (
                      <div className="truncate">{productName}</div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                  <div className="col-span-5">
                    {productSpecs ? (
                      <>
                        <div className={expanded ? "whitespace-pre-wrap break-all" : "truncate"}>{productSpecs}</div>
                        {productSpecs.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleRow(i)}
                            className="mt-0.5 text-[11px] underline text-gray-600 hover:text-gray-800"
                          >
                            {expanded ? '접기' : '펼치기'}
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </>
              ) : (
                <div className="col-span-12 whitespace-pre-wrap break-all text-xs">{String(doc)}</div>
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