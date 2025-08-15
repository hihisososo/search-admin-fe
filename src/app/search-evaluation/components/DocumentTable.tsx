import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
// removed add-document dialog imports
// select 제거: 버튼형 세그먼트로 대체
import { cn } from "@/lib/utils"
import { Edit, Trash2, ChevronDown, ChevronUp, X, Save, RotateCcw } from "lucide-react"
import { 
  // useProductSearch, (removed add-document feature)
  // useAddDocumentMapping,
  useUpdateCandidate
} from "@/hooks/use-evaluation"
import type { EvaluationDocument, RelevanceStatus } from "@/services"
import React from "react"
import { useToast } from "@/components/ui/use-toast"
// import { PAGINATION } from "@/constants/pagination"
import { PaginationControls } from "@/components/common/PaginationControls"

// 평가 상태 타입 정의 (UI용)
type EvaluationStatus = 'correct' | 'incorrect' | 'unspecified'

interface DocumentTableProps {
  queryId: number
  query: string
  documents: EvaluationDocument[]
  currentPage: number
  totalPages: number
  totalCount: number
  onPageChange: (page: number) => void
  onClose?: () => void
  isLoading: boolean
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  sortField?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (field: string) => void
}

export function DocumentTable({
  queryId: _queryId,
  query,
  documents,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  onClose,
  isLoading,
  pageSize,
  onPageSizeChange,
  sortField: _sortField,
  sortDirection: _sortDirection,
  onSort
}: DocumentTableProps) {
  // removed add-document dialog states
  const [expandedDocument, setExpandedDocument] = useState<string | null>(null)
  const { toast } = useToast()
  
  // 편집 상태 관리
  const [editingDocument, setEditingDocument] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{
    relevanceStatus: RelevanceStatus
    evaluationReason: string
    score: number // -1 | 0 | 1 | 2
  }>({
    relevanceStatus: 'UNSPECIFIED',
    evaluationReason: '',
    score: -1
  })

  // API 호출
  // removed add-document query
  
  // 뮤테이션
  // removed add-document mutation
  const updateCandidateMutation = useUpdateCandidate()

  // 평가 상태 변환 함수
  const getEvaluationStatus = (relevanceStatus: RelevanceStatus): EvaluationStatus => {
    switch (relevanceStatus) {
      case 'RELEVANT': return 'correct'
      case 'IRRELEVANT': return 'incorrect'
      case 'UNSPECIFIED':
      default: return 'unspecified'
    }
  }

  // 상태 뱃지(정답/오답/미지정) 사용 중단 → 점수 뱃지로 대체

  // evaluationReason 에 포함된 (score: n) 추출
  const extractScore = (reason?: string | null): number | null => {
    if (!reason) return null
    const match = reason.match(/\(score:\s*(\d)\)/i)
    if (!match) return null
    const num = Number(match[1])
    return Number.isFinite(num) ? num : null
  }

  const getScoreBadge = (score: number | null) => {
    if (score === null || score === -1) {
      return (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">미평가</Badge>
      )
    }
    const colorClass = score >= 2
      ? 'bg-green-50 text-green-700 border-green-200'
      : score === 1
        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
        : 'bg-red-50 text-red-700 border-red-200'
    const label = score >= 2 ? '매우관련' : (score === 1 ? '관련' : '관련없음')
    return (
      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${colorClass}`}>
        {label}
      </Badge>
    )
  }

  // 상품 추가 핸들러
  // removed add-document handler

  // 편집 시작 핸들러
  const handleStartEdit = (doc: EvaluationDocument) => {
    setEditingDocument(doc.productId)
    setEditForm({
      relevanceStatus: doc.relevanceStatus,
      evaluationReason: doc.evaluationReason || '',
      score: extractScore(doc.evaluationReason) ?? -1
    })
  }

  // 편집 취소 핸들러
  const handleCancelEdit = () => {
    setEditingDocument(null)
    setEditForm({
      relevanceStatus: 'UNSPECIFIED',
      evaluationReason: '',
      score: -1
    })
  }

  // 편집 저장 핸들러
  const handleSaveEdit = async (doc: EvaluationDocument) => {
    try {
      // score 기반으로 relevanceStatus 결정
      const newStatus: RelevanceStatus = editForm.score >= 1
        ? 'RELEVANT'
        : (editForm.score === 0 ? 'IRRELEVANT' : 'UNSPECIFIED')

      // evaluationReason에 (score: n) 반영
      const upsertScore = (reason: string, score: number): string => {
        const base = (reason || '').trim()
        const replaced = base.replace(/\(score:\s*-?\d+\)/i, '').trim()
        const suffix = `(score: ${score})`
        return replaced.length > 0 ? `${replaced} ${suffix}` : suffix
      }

      await updateCandidateMutation.mutateAsync({
        candidateId: doc.candidateId,
        data: {
          relevanceStatus: newStatus,
          evaluationReason: upsertScore(editForm.evaluationReason, editForm.score)
        }
      })
      setEditingDocument(null)
      setEditForm({
        relevanceStatus: 'UNSPECIFIED',
        evaluationReason: '',
        score: -1
      })
      // 문서 데이터 새로고침을 위해 부모 컴포넌트에서 처리하도록 함
      toast({
        title: "수정 완료",
        description: "평가 정보가 성공적으로 수정되었습니다.",
        variant: "success"
      })
      // 페이지 새로고침 대신 상태 업데이트를 위해 onRefresh가 있다면 호출
    } catch (error) {
      toast({
        title: "수정 실패",
        description: (error as Error).message,
        variant: "destructive"
      })
    }
  }

  // 문서 삭제 핸들러
  const handleDeleteDocument = (_productId: string) => {
    if (confirm('정답 문서를 삭제하시겠습니까?')) {
      toast({
        title: "기능 준비 중",
        description: "삭제 기능은 현재 준비 중입니다.",
        variant: "default"
      })
    }
  }

  // 아코디언 토글
  const toggleExpand = (productId: string) => {
    setExpandedDocument(expandedDocument === productId ? null : productId)
  }

  // 텍스트 개행 처리 함수
  const formatText = (text: string | null) => {
    if (!text) return ''
    return text.replace(/\\n/g, '\n').replace(/\n/g, '\n')
  }

  // util: evaluationReason에 (score: n) 값을 갱신/삽입
  const upsertScore = (reason: string, score: number): string => {
    const base = (reason || '').trim()
    const replaced = base.replace(/\(score:\s*-?\d+\)/i, '').trim()
    const suffix = `(score: ${score})`
    return replaced.length > 0 ? `${replaced} ${suffix}` : suffix
  }

  const mapScoreToStatus = (score: number): RelevanceStatus => {
    return score >= 1 ? 'RELEVANT' : (score === 0 ? 'IRRELEVANT' : 'UNSPECIFIED')
  }

  // 인라인 score 선택 처리
  const handleQuickSetScore = async (doc: EvaluationDocument, score: number) => {
    try {
      await updateCandidateMutation.mutateAsync({
        candidateId: doc.candidateId,
        data: {
          relevanceStatus: mapScoreToStatus(score),
          evaluationReason: upsertScore(doc.evaluationReason || '', score)
        }
      })
      toast({ title: 'score 변경', description: `score가 ${score}로 변경되었습니다.`, variant: 'success' })
    } catch (error) {
      toast({ title: '변경 실패', description: (error as Error).message, variant: 'destructive' })
    }
  }



  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-8" />
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-16 py-2 text-xs font-semibold text-gray-700">순번</TableHead>
                  <TableHead className="w-32 py-2 text-xs font-semibold text-gray-700">상품 ID</TableHead>
                  <TableHead className="py-2 text-xs font-semibold text-gray-700">상품명</TableHead>
                  <TableHead className="w-32 py-2 text-xs font-semibold text-gray-700 text-center">평가 상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    )
  }

  return (
      <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            "{query}"
          </h3>
          {/* 상단 총 건수/페이지 문구 제거 */}
        </div>
        
        <div className="flex items-center gap-2">
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 페이지 크기 선택 제거 */}

      {/* 데이터 테이블 */}
      <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-16 py-2 text-xs font-semibold text-gray-700 text-center">순번</TableHead>
              <TableHead
                className="w-32 py-2 text-xs font-semibold text-gray-700 cursor-pointer"
                onClick={() => onSort?.('productId')}
              >
                상품 ID
              </TableHead>
              <TableHead className="py-2 text-xs font-semibold text-gray-700 cursor-pointer" onClick={() => onSort?.('productName')}>상품명</TableHead>
              <TableHead className="w-32 py-2 text-xs font-semibold text-gray-700 text-center cursor-pointer" onClick={() => onSort?.('relevanceScore')}>
                <div className="flex items-center justify-center gap-1">
                  <span>평가</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                  <div className="space-y-2">
                    <p className="text-base font-medium">등록된 정답 문서가 없습니다</p>
                    <p className="text-sm text-gray-400">상품을 추가해서 정답 문서를 만들어보세요</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc, index) => {
                const _status = getEvaluationStatus(doc.relevanceStatus)
                const isExpanded = expandedDocument === doc.productId
                
                return (
                  <React.Fragment key={doc.productId}>
                    <TableRow 
                      className={`hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-amber-50' : ''}`}
                      onClick={() => toggleExpand(doc.productId)}
                    >
                      <TableCell className="py-2 text-center font-medium text-gray-600">
                        {(currentPage * (pageSize ?? 20)) + index + 1}
                      </TableCell>
                      
                      <TableCell className="py-2 text-xs">
                        <Badge variant="outline" className="font-mono text-xs">
                          {doc.productId}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="py-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-xs text-gray-900">
                            {doc.productName}
                          </div>
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-2 text-center">
                        <div className="flex justify-center items-center gap-1">
                          {([2,1,0,-1] as const).map((val) => {
                            const current = extractScore(doc.evaluationReason) ?? -1
                            const isActive = current === val
                            const label = val === 2 ? '매우관련' : val === 1 ? '관련' : val === 0 ? '관련없음' : '미평가'
                            const colorClass = val === 2
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : val === 1
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : val === 0
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-gray-50 text-gray-700 border-gray-200'
                            return (
                              <Button
                                key={val}
                                variant={isActive ? 'outline' : 'outline'}
                                size="sm"
                                disabled={updateCandidateMutation.isPending}
                                className={cn(
                                  'h-6 text-[10px] px-2 py-0',
                                  isActive ? colorClass : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                )}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleQuickSetScore(doc, val)
                                }}
                              >
                                {label}
                              </Button>
                            )
                          })}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* 아코디언 상세 정보 */}
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={4} className="p-0">
                          <div className="bg-gray-50 border-t p-6 space-y-6">
                            {editingDocument === doc.productId ? (
                              /* 편집 모드 */
                              <>
                                {/* 상품 스펙 (별도 줄, 읽기 전용) */}
                                <div className="mb-6">
                                  <label className="text-sm font-semibold text-gray-700 block mb-3">
                                    📋 상품 스펙
                                  </label>
                                  <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded-r">
                                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                      {formatText(doc.specs) || '스펙 정보가 없습니다'}
                                    </div>
                                  </div>
                                </div>

                                {/* 평가 이유 (편집 가능) */}
                                <div>
                                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                                    ✏️ 평가 이유 *
                                  </label>
                                  <textarea
                                    value={editForm.evaluationReason}
                                    onChange={(e) => setEditForm({ ...editForm, evaluationReason: e.target.value })}
                                    placeholder="평가 이유를 입력하세요..."
                                    className="w-full min-h-[120px] text-sm text-gray-900 bg-white p-3 rounded border resize-none leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>

                                {/* 평가 선택 */}
                                <div className="mb-6">
                                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                                    🏷️ 평가 *
                                  </label>
                                  <div className="flex gap-2">
                                    {([2,1,0,-1] as const).map((val) => {
                                      const isActive = editForm.score === val
                                      const label = val === 2 ? '매우관련' : val === 1 ? '관련' : val === 0 ? '관련없음' : '미평가'
                                      const colorClass = val === 2
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : val === 1
                                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                          : val === 0
                                            ? 'bg-red-50 text-red-700 border-red-200'
                                            : 'bg-gray-50 text-gray-700 border-gray-200'
                                      return (
                                        <Button
                                          key={val}
                                          variant={isActive ? 'outline' : 'outline'}
                                          size="sm"
                                          className={cn(
                                            'h-7 text-xs px-2',
                                            isActive ? colorClass : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                          )}
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setEditForm({ ...editForm, score: val })
                                          }}
                                        >
                                          {label}
                                        </Button>
                                      )
                                    })}
                                  </div>
                                </div>

                                {/* 편집 액션 버튼들 */}
                                <div className="flex gap-2 pt-2 border-t">
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSaveEdit(doc)
                                    }}
                                    disabled={updateCandidateMutation.isPending}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Save className="h-4 w-4 mr-2" />
                                    {updateCandidateMutation.isPending ? '저장중...' : '저장'}
                                  </Button>
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleCancelEdit()
                                    }}
                                    disabled={updateCandidateMutation.isPending}
                                  >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    취소
                                  </Button>
                                </div>
                              </>
                            ) : (
                              /* 읽기 모드 */
                              <>
                                {/* 상품 스펙 (별도 줄, 읽기 전용) */}
                                <div className="mb-6">
                                  <label className="text-sm font-semibold text-gray-700 block mb-3">
                                    📋 상품 스펙
                                  </label>
                                  <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded-r">
                                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                      {formatText(doc.specs) || '스펙 정보가 없습니다'}
                                    </div>
                                  </div>
                                </div>

                                {/* 평가 이유 */}
                                <div className="mb-6">
                                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                                    💭 평가 이유
                                  </label>
                                  <div className="bg-white border p-3 rounded leading-relaxed whitespace-pre-wrap text-sm text-gray-600">
                                    {formatText(doc.evaluationReason) || '평가 이유가 없습니다'}
                                  </div>
                                </div>

                                {/* 현재 평가 표시 */}
                                <div className="mb-6">
                                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                                    🏷️ 평가
                                  </label>
                                  <div className="flex items-center">
                                    {getScoreBadge(extractScore(doc.evaluationReason))}
                                  </div>
                                </div>

                                {/* 읽기 모드 액션 버튼들 */}
                                <div className="flex gap-2 pt-2 border-t">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleStartEdit(doc)
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    편집
                                  </Button>
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteDocument(doc.productId)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    삭제
                                  </Button>
                                </div>
                              </>
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
        <div className="mt-3 pt-2 border-t border-gray-100">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize ?? 20}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange ?? (() => {})}
          />
        </div>
      )}
    </div>
  )
} 