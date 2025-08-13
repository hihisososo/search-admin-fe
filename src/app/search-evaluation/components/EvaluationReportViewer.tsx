import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, parseEvaluationDetails } from "@/utils/evaluation-helpers"
import { EVALUATION_CONFIG } from "@/constants/evaluation"
import { PerformanceScore } from "./PerformanceScore"
import type { EvaluationReport } from "@/services/evaluation/types"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EvaluationReportViewerProps {
  report: EvaluationReport
}

export function EvaluationReportViewer({ report }: EvaluationReportViewerProps) {
  const { success, queryDetails, error } = parseEvaluationDetails(report.detailedResults || '')
  const [sortBy, setSortBy] = useState<'f1' | 'precision' | 'recall' | 'correct' | 'retrieved'>('f1')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')
  const [onlyIssues, setOnlyIssues] = useState(false)
  const [showAllDocs, setShowAllDocs] = useState(false)

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
          {success && queryDetails ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                    <SelectTrigger className="h-8 w-36 text-xs">
                      <SelectValue placeholder="정렬 기준" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="f1">F1 Score</SelectItem>
                      <SelectItem value="precision">Precision</SelectItem>
                      <SelectItem value="recall">Recall</SelectItem>
                      <SelectItem value="correct">정답 수</SelectItem>
                      <SelectItem value="retrieved">검색 수</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" className="h-8" onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}>
                    {sortDir === 'desc' ? '내림차순' : '오름차순'}
                  </Button>
                  <Button size="sm" variant="outline" className={`h-8 ${onlyIssues ? 'border-amber-600 text-amber-700 bg-amber-50' : ''}`} onClick={() => setOnlyIssues(v => !v)}>
                    이슈만 보기
                  </Button>
                  <Button size="sm" variant="outline" className={`h-8 ${showAllDocs ? 'border-blue-600 text-blue-700 bg-blue-50' : ''}`} onClick={() => setShowAllDocs(v => !v)}>
                    문서 전체 표시
                  </Button>
                </div>
                <a
                  href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(queryDetails, null, 2))}`}
                  download={`evaluation-query-details-${report.id}.json`}
                >
                  <Button size="sm" variant="outline" className="h-8">JSON 내보내기</Button>
                </a>
              </div>
              <QueryDetailsView queryDetails={queryDetails} sortBy={sortBy} sortDir={sortDir} onlyIssues={onlyIssues} showAllDocs={showAllDocs} />
              <details className="mt-3">
                <summary className="text-xs text-gray-600 cursor-pointer">원본 상세 JSON 보기</summary>
                <div className="mt-2 bg-gray-50 border rounded p-2 max-h-64 overflow-auto">
                  <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(queryDetails, null, 2)}</pre>
                </div>
              </details>
            </>
          ) : (
            <ErrorView error={error} detailedResults={report.detailedResults} />
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

function QueryDetailsView({ queryDetails, sortBy, sortDir, onlyIssues, showAllDocs }: { queryDetails: any[]; sortBy: 'f1' | 'precision' | 'recall' | 'correct' | 'retrieved'; sortDir: 'asc' | 'desc'; onlyIssues: boolean; showAllDocs: boolean }) {
  const sorted = [...queryDetails]
    .filter((d) => !onlyIssues || (d.missingDocuments?.length > 0 || d.wrongDocuments?.length > 0))
    .sort((a, b) => {
      const getMetric = (x: any) => {
        if (sortBy === 'f1') return Number(x.f1Score ?? 0)
        if (sortBy === 'precision') return Number(x.precision ?? 0)
        if (sortBy === 'recall') return Number(x.recall ?? 0)
        if (sortBy === 'correct') return Number(x.correctCount ?? 0)
        if (sortBy === 'retrieved') return Number(x.retrievedCount ?? 0)
        return 0
      }
      const av = getMetric(a)
      const bv = getMetric(b)
      return sortDir === 'desc' ? (bv - av) : (av - bv)
    })
  const displayedQueries = sorted.slice(0, EVALUATION_CONFIG.MAX_DISPLAYED_QUERY_DETAILS)
  
  return (
    <div className="space-y-4">
      {displayedQueries.map((detail: any, index: number) => (
        <QueryDetailCard key={index} detail={detail} showAllDocs={showAllDocs} />
      ))}
      
      {queryDetails.length > EVALUATION_CONFIG.MAX_DISPLAYED_QUERY_DETAILS && (
        <div className="text-center text-sm text-gray-500 pt-2 border-t">
          상위 {EVALUATION_CONFIG.MAX_DISPLAYED_QUERY_DETAILS}개 쿼리만 표시됨 (전체 {queryDetails.length}개)
        </div>
      )}
    </div>
  )
}

function QueryDetailCard({ detail, showAllDocs }: { detail: any; showAllDocs: boolean }) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-gray-900">
            {detail.query}
          </h4>
          <div className="flex gap-4 mt-2 text-xs">
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
            <PerformanceScore 
              score={detail.f1Score} 
              label="F1" 
              size="sm"
              showPercentage={true}
            />
          </div>
        </div>
        <div className="text-right text-xs text-gray-600">
          <div>관련: {detail.relevantCount}</div>
          <div>검색: {detail.retrievedCount}</div>
          <div>정답: {detail.correctCount}</div>
        </div>
      </div>
      
      {(detail.missingDocuments?.length > 0 || detail.wrongDocuments?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {detail.missingDocuments?.length > 0 && (
            <DocumentList 
              documents={detail.missingDocuments}
              title="누락된 문서"
              bgColor="bg-red-50"
              textColor="text-red-800"
              subTextColor="text-red-600"
              moreTextColor="text-red-500"
              showAllDocs={showAllDocs}
            />
          )}
          
          {detail.wrongDocuments?.length > 0 && (
            <DocumentList 
              documents={detail.wrongDocuments}
              title="잘못된 문서"
              bgColor="bg-yellow-50"
              textColor="text-yellow-800"
              subTextColor="text-yellow-600"
              moreTextColor="text-yellow-500"
              showAllDocs={showAllDocs}
            />
          )}
        </div>
      )}
    </div>
  )
}

type ReportDoc = string | { productId: string; productName: string; productSpecs: string }

function DocumentList({ 
  documents, 
  title, 
  bgColor, 
  textColor, 
  subTextColor, 
  moreTextColor,
  showAllDocs = false
}: {
  documents: ReportDoc[]
  title: string
  bgColor: string
  textColor: string
  subTextColor: string
  moreTextColor: string
  showAllDocs?: boolean
}) {
  const maxDisplayed = EVALUATION_CONFIG.MAX_DISPLAYED_MISSING_DOCS
  const displayedDocs = showAllDocs ? documents : documents.slice(0, maxDisplayed)
  const remainingCount = showAllDocs ? 0 : (documents.length - maxDisplayed)

  return (
    <div className={`${bgColor} p-2 rounded`}>
      <div className={`${textColor} font-medium mb-1`}>
        {title} ({documents.length})
      </div>
      <div className={`${subTextColor} space-y-1`}>
        {displayedDocs.map((doc: ReportDoc, i: number) => {
          const line = typeof doc === 'string' 
            ? doc 
            : `${doc.productId} ${doc.productName} | ${doc.productSpecs}`
          return (
            <div key={i} className="whitespace-pre-wrap break-all text-xs">{line}</div>
          )
        })}
        {remainingCount > 0 && (
          <div className={moreTextColor}>
            +{remainingCount}개 더
          </div>
        )}
      </div>
    </div>
  )
}

function ErrorView({ error, detailedResults }: { error?: string; detailedResults?: string }) {
  if (!error) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>상세 결과 데이터가 없습니다.</p>
        <p className="text-sm mt-1">백엔드에서 detailedResults를 제공하지 않았습니다.</p>
      </div>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="text-red-800 font-medium mb-2">⚠️ 데이터 파싱 오류</div>
      <div className="text-red-600 text-sm mb-3">
        {error}
      </div>
      {detailedResults && (
        <details>
          <summary className="text-sm text-red-700 cursor-pointer mb-2">원본 데이터 보기</summary>
          <div className="bg-white border rounded p-2 max-h-48 overflow-y-auto">
            <pre className="text-xs whitespace-pre-wrap">{detailedResults}</pre>
          </div>
        </details>
      )}
    </div>
  )
} 