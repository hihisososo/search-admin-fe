import { useState } from "react"
import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { Play, RefreshCw, Plus, Trash2 } from "lucide-react"
import { useEvaluationReports, useEvaluateAsync, useDeleteEvaluationReport } from "@/hooks/use-evaluation"
import { useAsyncTask } from "@/hooks/use-async-task"
import { evaluationService } from "@/services/evaluation/api"
import { formatDate, getTaskProgressText } from "@/utils/evaluation-helpers"
import { useToast } from "@/components/ui/use-toast"
import { PerformanceScore } from "../components/PerformanceScore"
import { EvaluationReportViewer } from "../components/EvaluationReportViewer"
import type { EvaluationReport } from "@/services/evaluation/types"

type SearchMode = 'KEYWORD_ONLY' | 'VECTOR_ONLY' | 'HYBRID_RRF'

export default function EvaluationExecutionPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [reportTitle, setReportTitle] = useState("")
  const [searchMode, setSearchMode] = useState<SearchMode>("KEYWORD_ONLY")
  const [rrfK, setRrfK] = useState(60)
  const [hybridTopK, setHybridTopK] = useState(300)
  const [selectedReport, setSelectedReport] = useState<EvaluationReport | null>(null)
  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState(false)
  const [isLoadingReport, setIsLoadingReport] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const { toast } = useToast()

  // API 훅들
  const reportsQuery = useEvaluationReports()
  const evaluateMutation = useEvaluateAsync()
  const deleteReportMutation = useDeleteEvaluationReport()
  
  // 비동기 작업 관리
  const evaluationTask = useAsyncTask('EVALUATION', {
    onComplete: (result) => {
      // 리포트 목록 새로고침
      reportsQuery.refetch()
      
      // 평가 결과 확인
      const evalResult = result ? JSON.parse(result) : null
      if (evalResult?.reportId) {
        toast({
          title: "평가 완료",
          description: `리포트 ID: ${evalResult.reportId}, Precision@20: ${evalResult.precision20?.toFixed(3) || 'N/A'}`,
          variant: "success"
        })
      } else {
        toast({
          title: "평가 완료",
          description: "리포트를 확인해주세요.",
          variant: "success"
        })
      }
    },
    onError: (error) => {
      toast({
        title: "평가 실패",
        description: error,
        variant: "destructive"
      })
    }
  })

  // 평가 실행 (비동기)
  const executeEvaluation = async () => {
    if (!reportTitle.trim()) return

    try {
      setIsStarting(true)
      const result = await evaluateMutation.mutateAsync({ 
        reportName: reportTitle.trim(),
        searchMode,
        ...(searchMode === 'HYBRID_RRF' && {
          rrfK,
          hybridTopK
        })
      })
      
      // 작업 추적 시작
      evaluationTask.startTask(result.taskId)
      
      // 다이얼로그 닫기
      setIsDialogOpen(false)
      setReportTitle("")
      
      // 성공 토스트
      toast({
        title: "평가 시작",
        description: `평가를 시작했습니다.`,
        variant: "default"
      })
      
      setIsStarting(false)
    } catch (error) {
      setIsStarting(false)
      console.error('❌ 평가 실행 실패:', error)
      toast({
        title: "평가 실행 실패",
        description: error instanceof Error ? error.message : '평가 실행에 실패했습니다.',
        variant: "destructive"
      })
    }
  }


  // 리포트 상세 보기  
  const viewReport = async (reportId: number) => {
    console.time(`[ViewReport-${reportId}] 전체 실행 시간`)
    console.log(`[ViewReport-${reportId}] 시작`)
    
    const startTime = performance.now()
    
    setIsLoadingReport(true)
    setIsReportDrawerOpen(true) // 드로어 먼저 열기
    setSelectedReport(null) // 이전 데이터 초기화
    
    console.log(`[ViewReport-${reportId}] 상태 업데이트 완료: ${(performance.now() - startTime).toFixed(2)}ms`)
    
    try {
      // TODO: useEvaluationReport 훅으로 변경 고려
      console.time(`[ViewReport-${reportId}] API 호출`)
      const report = await evaluationService.getReport(reportId)
      console.timeEnd(`[ViewReport-${reportId}] API 호출`)
      
      console.log(`[ViewReport-${reportId}] 응답 데이터:`, {
        reportId: report.id,
        totalQueries: report.totalQueries,
        queryDetailsLength: report.queryDetails?.length || 0,
        queryDetailsSize: JSON.stringify(report.queryDetails || []).length,
        firstQueryDetail: report.queryDetails?.[0]
      })
      
      console.time(`[ViewReport-${reportId}] setState 실행`)
      setSelectedReport(report)
      console.timeEnd(`[ViewReport-${reportId}] setState 실행`)
      
    } catch (error) {
      console.error('❌ 리포트 조회 실패:', error)
      toast({
        title: "리포트 조회 실패",
        description: "리포트 조회에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive"
      })
      setIsReportDrawerOpen(false)
    } finally {
      setIsLoadingReport(false)
      console.timeEnd(`[ViewReport-${reportId}] 전체 실행 시간`)
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

      toast({
        title: "리포트 삭제 완료",
        description: "리포트가 삭제되었습니다.",
        variant: "success"
      })
    } catch (error) {
      console.error('❌ 리포트 삭제 실패:', error)
      toast({
        title: "리포트 삭제 실패",
        description: "리포트 삭제에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive"
      })
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
                  검색 성능을 평가하여 Precision@20을 계산합니다.
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
                  <Label htmlFor="searchMode">검색 모드</Label>
                  <Select value={searchMode} onValueChange={(value) => setSearchMode(value as SearchMode)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KEYWORD_ONLY">키워드 검색 (BM25)</SelectItem>
                      <SelectItem value="VECTOR_ONLY">벡터 검색</SelectItem>
                      <SelectItem value="HYBRID_RRF">하이브리드 (RRF)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {searchMode === "HYBRID_RRF" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rrfK">RRF K값</Label>
                      <Input
                        id="rrfK"
                        type="number"
                        value={rrfK}
                        onChange={(e) => setRrfK(Number(e.target.value))}
                        min={1}
                        max={100}
                      />
                      <p className="text-xs text-gray-500">기본값: 60</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hybridTopK">Hybrid Top K</Label>
                      <Input
                        id="hybridTopK"
                        type="number"
                        value={hybridTopK}
                        onChange={(e) => setHybridTopK(Number(e.target.value))}
                        min={10}
                        max={500}
                      />
                      <p className="text-xs text-gray-500">기본값: 100</p>
                    </div>
                  </div>
                )}
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
                  disabled={!reportTitle.trim() || isStarting || evaluationTask.isRunning}
                  className="flex items-center gap-2"
                >
                  {isStarting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      시작중...
                    </>
                  ) : evaluationTask.isRunning ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      {getTaskProgressText(evaluationTask.data, '평가 진행중')}
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

        {/* 진행 중인 작업 표시 */}
        {evaluationTask.isRunning && evaluationTask.data && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {getTaskProgressText(evaluationTask.data, '평가 진행 중')}
                </span>
              </div>
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                {evaluationTask.data.status}
              </Badge>
            </div>
            {evaluationTask.data.progress && (
              <div className="mt-2">
                <div className="w-full bg-blue-100 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${evaluationTask.data.progress}%` }}
                  />
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  {evaluationTask.data.progress}% 완료
                </p>
              </div>
            )}
          </div>
        )}

        {/* 평가 히스토리 - 카드 제거, 테이블 컨테이너 스타일 통일 */}
        <div>
          <div className="mb-2">
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
                    <TableHead className="text-center w-24 py-2 text-xs font-semibold text-gray-700">Precision@20</TableHead>
                    <TableHead className="w-44 py-2 text-xs font-semibold text-gray-700">실행 시간</TableHead>
                    <TableHead className="text-center w-20 py-2 text-xs font-semibold text-gray-700">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!reportsQuery.data || reportsQuery.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                        <div className="text-gray-500">
                          <p>아직 실행된 평가가 없습니다.</p>
                          <p className="text-sm text-gray-400 mt-1">새 평가를 실행해보세요.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportsQuery.data.map((report) => (
                      <TableRow key={report.id} className="hover:bg-gray-50">
                        <TableCell className="py-2 text-xs text-gray-700 font-medium">{report.id}</TableCell>
                        <TableCell className="py-2">
                          <button
                            onClick={() => viewReport(report.id)}
                            className="text-xs font-medium text-gray-900 hover:text-blue-600 text-left transition-colors"
                          >
                            {report.reportName}
                          </button>
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          <Badge className="bg-green-100 text-green-800 text-xs">완료</Badge>
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          <PerformanceScore score={report.averagePrecision20 || 0} size="sm" showPercentage={false} />
                        </TableCell>
                        <TableCell className="py-2 text-xs text-gray-600">
                          {formatDate(report.createdAt)}
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          <Button 
                            size="sm"
                            variant="outline" 
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteReport(report.id, report.reportName)
                            }}
                            className="h-6 w-6 p-0 border-red-300 text-red-600 hover:bg-red-50"
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
              <DrawerHeader className="px-6 py-4 border-b">
                <DrawerTitle className="text-base font-semibold text-gray-900">평가 리포트 상세</DrawerTitle>
                <DrawerDescription className="text-xs text-gray-500 mt-1">{selectedReport?.reportName || '리포트를 불러오는 중...'}</DrawerDescription>
              </DrawerHeader>
              <div className="flex-1 overflow-auto px-6 py-4" data-vaul-no-drag>
                {isLoadingReport ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                      <p className="text-sm text-gray-600">리포트를 불러오는 중...</p>
                    </div>
                  </div>
                ) : selectedReport ? (
                  <EvaluationReportViewer report={selectedReport} />
                ) : null}
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