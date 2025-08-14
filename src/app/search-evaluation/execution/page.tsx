import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Play, BarChart3, CheckCircle, RefreshCw, Plus, Trash2 } from "lucide-react"
import { useEvaluationReports, useEvaluate, useDeleteEvaluationReport } from "@/hooks/use-evaluation"
import { evaluationService } from "@/services/evaluation/api"
import { formatDate } from "@/utils/evaluation-helpers"
import { EVALUATION_CONFIG } from "@/constants/evaluation"
import { PerformanceScore } from "../components/PerformanceScore"
import { EvaluationReportViewer } from "../components/EvaluationReportViewer"
import type { EvaluationReport } from "@/services/evaluation/types"

export default function EvaluationExecutionPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [reportTitle, setReportTitle] = useState("")
  const [retrievalSize, setRetrievalSize] = useState<number>(EVALUATION_CONFIG.DEFAULT_RETRIEVAL_SIZE)
  const [selectedReport, setSelectedReport] = useState<EvaluationReport | null>(null)
  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState(false)

  // API 훅들
  const reportsQuery = useEvaluationReports()
  const evaluateMutation = useEvaluate()
  const deleteReportMutation = useDeleteEvaluationReport()

  // 평가 실행
  const executeEvaluation = async () => {
    if (!reportTitle.trim()) return

    try {
      const result = await evaluateMutation.mutateAsync({ 
        reportName: reportTitle.trim(), 
        retrievalSize 
      })
      
      // 성공 처리
      setIsDialogOpen(false)
      setReportTitle("")
      setRetrievalSize(EVALUATION_CONFIG.DEFAULT_RETRIEVAL_SIZE)
      
      // 성공 알림
      alert(`평가가 완료되었습니다!\n\n` +
        `📊 Precision: ${(result.averagePrecision * 100).toFixed(1)}%\n` +
        `📊 Recall: ${(result.averageRecall * 100).toFixed(1)}%\n` +
        `📊 F1 Score: ${(result.averageF1Score * 100).toFixed(1)}%\n\n` +
        `🔍 총 쿼리: ${result.totalQueries}개\n` +
        `📋 관련 문서: ${result.totalRelevantDocuments}개\n` +
        `🔍 검색된 문서: ${result.totalRetrievedDocuments}개\n` +
        `✅ 정답 문서: ${result.totalCorrectDocuments}개`)
      
      // 새로 생성된 리포트 자동으로 열기
      setTimeout(() => viewReport(result.reportId), 500)
    } catch (error) {
      console.error('❌ 평가 실행 실패:', error)
      alert('평가 실행에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // 리포트 상세 보기  
  const viewReport = async (reportId: number) => {
    try {
      // TODO: useEvaluationReport 훅으로 변경 고려
      const report = await evaluationService.getReport(reportId)
      setSelectedReport(report)
      setIsReportDrawerOpen(true)
    } catch (error) {
      console.error('❌ 리포트 조회 실패:', error)
      alert('리포트 조회에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // 리포트 삭제
  const deleteReport = async (reportId: number, reportName: string) => {
    if (!confirm(`"${reportName}" 리포트를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    try {
      await deleteReportMutation.mutateAsync(reportId)

      // 상세 드로어가 열려 있고 동일 리포트를 보고 있었다면 닫기
      if (selectedReport?.id === reportId) {
        setIsReportDrawerOpen(false)
        setSelectedReport(null)
      }

      alert('리포트가 삭제되었습니다.')
    } catch (error) {
      console.error('❌ 리포트 삭제 실패:', error)
      alert('리포트 삭제에 실패했습니다. 다시 시도해주세요.')
    }
  }





  return (
    <div className="w-full min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
		{/* 상단 액션 영역 - 우측 정렬 */}
		<div className="flex flex-wrap items-center justify-end w-full gap-2 mb-8">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                새 평가 실행
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새로운 평가 실행</DialogTitle>
                <DialogDescription>
                  검색 성능을 평가하여 Precision, Recall, F1 Score를 계산합니다. 
                  모든 쿼리에 대한 평가가 실행되며 결과는 리포트로 저장됩니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">리포트 제목</Label>
                  <Input
                    id="title"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="예: 2024년 1월 검색 성능 평가"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retrievalSize">검색 결과 개수</Label>
                  <Select value={retrievalSize.toString()} onValueChange={(value) => setRetrievalSize(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EVALUATION_CONFIG.AVAILABLE_RETRIEVAL_SIZES.map(size => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}개{size === EVALUATION_CONFIG.DEFAULT_RETRIEVAL_SIZE ? ' (기본값)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">평가에 사용할 검색 결과의 개수를 설정하세요</p>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={evaluateMutation.isPending}
                >
                  취소
                </Button>
                <Button 
                  onClick={executeEvaluation}
                  disabled={!reportTitle.trim() || evaluateMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {evaluateMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      실행중...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      실행
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* 평가 히스토리 - 카드 제거, 테이블 컨테이너 스타일 통일 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5" />
            <h3 className="text-base font-semibold text-gray-900">평가 히스토리</h3>
          </div>
          <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
            {reportsQuery.isLoading ? (
              <ReportsTableSkeleton />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="w-16 py-2 text-xs font-semibold text-gray-700">ID</TableHead>
                    <TableHead className="py-2 text-xs font-semibold text-gray-700">제목</TableHead>
                    <TableHead className="text-center w-24 py-2 text-xs font-semibold text-gray-700">상태</TableHead>
                    <TableHead className="text-center w-24 py-2 text-xs font-semibold text-gray-700">Precision</TableHead>
                    <TableHead className="text-center w-24 py-2 text-xs font-semibold text-gray-700">Recall</TableHead>
                    <TableHead className="text-center w-24 py-2 text-xs font-semibold text-gray-700">F1 Score</TableHead>
                    <TableHead className="w-44 py-2 text-xs font-semibold text-gray-700">실행 시간</TableHead>
                    <TableHead className="text-center w-24 py-2 text-xs font-semibold text-gray-700">삭제</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!reportsQuery.data || reportsQuery.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                        <div className="text-gray-500">
                          <p>아직 실행된 평가가 없습니다.</p>
                          <p className="text-sm text-gray-400 mt-1">새 평가를 실행해보세요.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportsQuery.data.map((report) => (
                      <TableRow key={report.id} className="hover:bg-gray-50">
                        <TableCell className="py-2 text-xs text-gray-700 font-medium">#{report.id}</TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <button
                              onClick={() => viewReport(report.id)}
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline text-left transition-colors"
                            >
                              {report.reportName}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          <Badge className="bg-green-100 text-green-800 text-xs py-0.5 px-2">완료</Badge>
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          <PerformanceScore score={report.averagePrecision} size="sm" />
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          <PerformanceScore score={report.averageRecall} size="sm" />
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          <PerformanceScore score={report.averageF1Score} size="sm" />
                        </TableCell>
                        <TableCell className="py-2 text-xs text-gray-600">
                          {formatDate(report.createdAt)}
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteReport(report.id, report.reportName)
                            }}
                            className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* 리포트 상세 슬라이드(드로어) */}
        <Drawer open={isReportDrawerOpen} onOpenChange={setIsReportDrawerOpen} direction="right">
          <DrawerContent className="h-full !w-[80vw] !max-w-none ml-auto fixed bottom-0 right-0 border-l shadow-2xl" data-vaul-no-drag>
            <div className="flex flex-col h-full bg-white">
              <div className="px-6 py-4 border-b">
                <h3 className="text-base font-semibold text-gray-900">평가 리포트 상세</h3>
                <p className="text-xs text-gray-500 mt-1">{selectedReport?.reportName}</p>
              </div>
              <div className="flex-1 overflow-auto px-6 py-4 select-text touch-pan-y" data-vaul-no-drag>
                {selectedReport && (
                  <EvaluationReportViewer report={selectedReport} />
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}

// 로딩 스켈레톤 컴포넌트
function ReportsTableSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[160px]" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
} 