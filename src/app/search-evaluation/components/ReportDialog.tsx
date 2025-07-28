import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, CheckCircle } from "lucide-react"
import { useEvaluationReports } from "@/hooks/use-evaluation"
import type { EvaluationReport } from "@/services"

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEvaluate: (data: { reportName: string }) => Promise<EvaluationReport>
  isLoading: boolean
}

export function ReportDialog({
  open,
  onOpenChange,
  onEvaluate,
  isLoading
}: ReportDialogProps) {
  const [reportName, setReportName] = useState("")
  const [latestReport, setLatestReport] = useState<EvaluationReport | null>(null)
  const [selectedReport, setSelectedReport] = useState<EvaluationReport | null>(null)
  
  // 기존 리포트 목록 조회
  const reportsQuery = useEvaluationReports()

  const handleEvaluate = async () => {
    if (!reportName.trim()) {
      alert('리포트 이름을 입력해주세요.')
      return
    }

    try {
      const report = await onEvaluate({ reportName: reportName.trim() })
      setLatestReport(report)
      setReportName("")
    } catch (error) {
      alert('평가 실행 실패: ' + (error as Error).message)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600"
    if (score >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 0.8) return "default"
    if (score >= 0.6) return "secondary"
    return "destructive"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            검색 평가 실행
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 새 평가 실행 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">새 평가 실행</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">리포트 이름</label>
                <Input
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="예: 2024-01-15 검색 성능 평가"
                />
              </div>
              
              <Button 
                onClick={handleEvaluate}
                disabled={isLoading || !reportName.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    평가 실행 중...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    평가 실행
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 최신 평가 결과 */}
          {latestReport && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  최신 평가 결과
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(latestReport.averagePrecision)}`}>
                      {(latestReport.averagePrecision * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">평균 Precision</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(latestReport.averageRecall)}`}>
                      {(latestReport.averageRecall * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">평균 Recall</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(latestReport.averageF1Score)}`}>
                      {(latestReport.averageF1Score * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">평균 F1 Score</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {latestReport.totalQueries}
                    </div>
                    <div className="text-sm text-gray-600">총 쿼리 수</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="font-medium text-gray-700">{latestReport.totalRelevantDocuments}</div>
                    <div className="text-gray-600">관련 문서</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="font-medium text-gray-700">{latestReport.totalRetrievedDocuments}</div>
                    <div className="text-gray-600">검색 문서</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="font-medium text-gray-700">{latestReport.totalCorrectDocuments}</div>
                    <div className="text-gray-600">정확 문서</div>
                  </div>
                </div>

                {/* 쿼리별 상세 결과 (처음 5개만) */}
                {(() => {
                  try {
                    const queryDetails = JSON.parse(latestReport.detailedResults || '[]')
                    if (queryDetails && queryDetails.length > 0) {
                      return (
                        <div>
                          <h4 className="font-medium mb-2">쿼리별 상세 결과 (상위 5개)</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {queryDetails.slice(0, 5).map((detail: any, index: number) => (
                              <div key={index} className="p-3 border rounded text-sm">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium">{detail.query}</span>
                                  <Badge variant={getScoreBadgeVariant(detail.f1Score)}>
                                    F1: {(detail.f1Score * 100).toFixed(1)}%
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                                  <span>Precision: {(detail.precision * 100).toFixed(1)}%</span>
                                  <span>Recall: {(detail.recall * 100).toFixed(1)}%</span>
                                  <span>정확: {detail.correctCount}/{detail.retrievedCount}</span>
                                </div>
                                {/* 누락/오답 문서 표시 */}
                                {(detail.missingDocuments?.length > 0 || detail.wrongDocuments?.length > 0) && (
                                  <div className="mt-2 pt-2 border-t space-y-1">
                                    {detail.missingDocuments?.length > 0 && (
                                      <div className="text-xs">
                                        <span className="text-red-600 font-medium">누락 문서:</span>
                                        <span className="ml-1 text-gray-600">
                                          {detail.missingDocuments.slice(0, 3).join(', ')}
                                          {detail.missingDocuments.length > 3 && ` 외 ${detail.missingDocuments.length - 3}개`}
                                        </span>
                                      </div>
                                    )}
                                    {detail.wrongDocuments?.length > 0 && (
                                      <div className="text-xs">
                                        <span className="text-orange-600 font-medium">오답 문서:</span>
                                        <span className="ml-1 text-gray-600">
                                          {detail.wrongDocuments.slice(0, 3).join(', ')}
                                          {detail.wrongDocuments.length > 3 && ` 외 ${detail.wrongDocuments.length - 3}개`}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }
                  } catch (error) {
                    console.error('detailedResults 파싱 오류:', error)
                  }
                  return null
                })()}
              </CardContent>
            </Card>
          )}

          {/* 기존 리포트 목록 */}
          {reportsQuery.data && reportsQuery.data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">기존 평가 리포트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {reportsQuery.data.map((report) => (
                    <div 
                      key={report.id} 
                      className={`p-3 border rounded cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedReport?.id === report.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{report.reportName}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(report.createdAt).toLocaleString('ko-KR')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              P: {(report.averagePrecision * 100).toFixed(1)}%
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              R: {(report.averageRecall * 100).toFixed(1)}%
                            </Badge>
                            <Badge variant={getScoreBadgeVariant(report.averageF1Score)} className="text-xs">
                              F1: {(report.averageF1Score * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {report.totalQueries}개 쿼리 • 클릭하여 상세보기
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 선택된 리포트 상세 결과 */}
          {selectedReport && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  {selectedReport.reportName} - 상세 결과
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  try {
                    const queryDetails = JSON.parse(selectedReport.detailedResults || '[]')
                    if (queryDetails && queryDetails.length > 0) {
                      return (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded">
                            <div className="text-center">
                              <div className={`text-xl font-bold ${getScoreColor(selectedReport.averagePrecision)}`}>
                                {(selectedReport.averagePrecision * 100).toFixed(1)}%
                              </div>
                              <div className="text-sm text-gray-600">평균 Precision</div>
                            </div>
                            <div className="text-center">
                              <div className={`text-xl font-bold ${getScoreColor(selectedReport.averageRecall)}`}>
                                {(selectedReport.averageRecall * 100).toFixed(1)}%
                              </div>
                              <div className="text-sm text-gray-600">평균 Recall</div>
                            </div>
                            <div className="text-center">
                              <div className={`text-xl font-bold ${getScoreColor(selectedReport.averageF1Score)}`}>
                                {(selectedReport.averageF1Score * 100).toFixed(1)}%
                              </div>
                              <div className="text-sm text-gray-600">평균 F1 Score</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-blue-600">
                                {selectedReport.totalQueries}
                              </div>
                              <div className="text-sm text-gray-600">총 쿼리 수</div>
                            </div>
                          </div>

                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            <h4 className="font-medium text-gray-900">전체 쿼리별 결과</h4>
                            {queryDetails.map((detail: any, index: number) => (
                              <div key={index} className="p-3 border rounded text-sm bg-white">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium">{detail.query}</span>
                                  <div className="flex gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      P: {(detail.precision * 100).toFixed(1)}%
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      R: {(detail.recall * 100).toFixed(1)}%
                                    </Badge>
                                    <Badge variant={getScoreBadgeVariant(detail.f1Score)} className="text-xs">
                                      F1: {(detail.f1Score * 100).toFixed(1)}%
                                    </Badge>
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-xs text-gray-600 mb-2">
                                  <span>관련: {detail.relevantCount}개</span>
                                  <span>검색: {detail.retrievedCount}개</span>
                                  <span>정확: {detail.correctCount}개</span>
                                </div>
                                {/* 누락/오답 문서 표시 */}
                                {(detail.missingDocuments?.length > 0 || detail.wrongDocuments?.length > 0) && (
                                  <div className="mt-2 pt-2 border-t space-y-1">
                                    {detail.missingDocuments?.length > 0 && (
                                      <div className="text-xs">
                                        <span className="text-red-600 font-medium">누락 문서 ({detail.missingDocuments.length}개):</span>
                                        <span className="ml-1 text-gray-600">
                                          {detail.missingDocuments.slice(0, 5).join(', ')}
                                          {detail.missingDocuments.length > 5 && ` 외 ${detail.missingDocuments.length - 5}개`}
                                        </span>
                                      </div>
                                    )}
                                    {detail.wrongDocuments?.length > 0 && (
                                      <div className="text-xs">
                                        <span className="text-orange-600 font-medium">오답 문서 ({detail.wrongDocuments.length}개):</span>
                                        <span className="ml-1 text-gray-600">
                                          {detail.wrongDocuments.slice(0, 5).join(', ')}
                                          {detail.wrongDocuments.length > 5 && ` 외 ${detail.wrongDocuments.length - 5}개`}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }
                  } catch (error) {
                    console.error('detailedResults 파싱 오류:', error)
                    return (
                      <div className="text-center py-8 text-gray-500">
                        <p>상세 결과를 불러올 수 없습니다.</p>
                        <p className="text-xs mt-1">데이터 형식 오류가 발생했습니다.</p>
                      </div>
                    )
                  }
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <p>상세 결과가 없습니다.</p>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 