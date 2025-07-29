import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Search, CheckCircle, XCircle, HelpCircle, Edit, Trash2, ChevronDown, ChevronUp, X, Save, RotateCcw } from "lucide-react"
import { 
  useProductSearch,
  useAddDocumentMapping,
  useUpdateCandidate
} from "@/hooks/use-evaluation"
import type { EvaluationDocument, EvaluationProduct, RelevanceStatus } from "@/services"
import React from "react"

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
}

export function DocumentTable({
  queryId,
  query,
  documents,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  onClose,
  isLoading
}: DocumentTableProps) {
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<EvaluationProduct | null>(null)
  const [expandedDocument, setExpandedDocument] = useState<string | null>(null)
  
  // 편집 상태 관리
  const [editingDocument, setEditingDocument] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{
    relevanceStatus: RelevanceStatus
    evaluationReason: string
  }>({
    relevanceStatus: 'UNSPECIFIED',
    evaluationReason: ''
  })

  // API 호출
  const productsQuery = useProductSearch(searchTerm, 20)
  
  // 뮤테이션
  const addDocumentMutation = useAddDocumentMapping()
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

  const getStatusBadge = (status: EvaluationStatus) => {
    switch (status) {
      case 'correct':
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            정답
          </Badge>
        )
      case 'incorrect':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            오답
          </Badge>
        )
      case 'unspecified':
        return (
          <Badge variant="secondary">
            <HelpCircle className="h-3 w-3 mr-1" />
            미지정
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <HelpCircle className="h-3 w-3 mr-1" />
            미지정
          </Badge>
        )
    }
  }

  // 상품 추가 핸들러
  const handleAddProduct = async () => {
    if (!selectedProduct) {
      alert('상품을 선택해주세요.')
      return
    }

    try {
      await addDocumentMutation.mutateAsync({
        queryId,
        data: { productId: selectedProduct.id }
      })
      setShowProductDialog(false)
      setSelectedProduct(null)
      setSearchTerm("")
      alert('상품 추가완료')
    } catch (error) {
      alert('상품 추가 실패: ' + (error as Error).message)
    }
  }

  // 편집 시작 핸들러
  const handleStartEdit = (doc: EvaluationDocument) => {
    setEditingDocument(doc.productId)
    setEditForm({
      relevanceStatus: doc.relevanceStatus,
      evaluationReason: doc.evaluationReason || ''
    })
  }

  // 편집 취소 핸들러
  const handleCancelEdit = () => {
    setEditingDocument(null)
    setEditForm({
      relevanceStatus: 'UNSPECIFIED',
      evaluationReason: ''
    })
  }

  // 편집 저장 핸들러
  const handleSaveEdit = async (doc: EvaluationDocument) => {
    try {
      await updateCandidateMutation.mutateAsync({
        candidateId: doc.candidateId,
        data: {
          relevanceStatus: editForm.relevanceStatus,
          evaluationReason: editForm.evaluationReason.trim()
        }
      })
      setEditingDocument(null)
      setEditForm({
        relevanceStatus: 'UNSPECIFIED',
        evaluationReason: ''
      })
      // 문서 데이터 새로고침을 위해 부모 컴포넌트에서 처리하도록 함
      alert('평가 정보 수정 완료')
      // 페이지 새로고침 대신 상태 업데이트를 위해 onRefresh가 있다면 호출
    } catch (error) {
      alert('수정 실패: ' + (error as Error).message)
    }
  }

  // 문서 삭제 핸들러
  const handleDeleteDocument = (productId: string) => {
    if (confirm('정답 문서를 삭제하시겠습니까?')) {
      alert('삭제 기능은 준비중입니다.')
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
                <TableRow className="bg-gray-50">
                  <TableHead className="w-16">순번</TableHead>
                  <TableHead className="w-32">상품 ID</TableHead>
                  <TableHead>상품명</TableHead>
                  <TableHead className="w-32 text-center">평가 상태</TableHead>
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
          <p className="text-xs text-gray-500 mt-1">
            전체 {totalCount.toLocaleString()}개 (페이지 {currentPage + 1}/{totalPages})
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white">
                <Plus className="h-3 w-3 mr-1" />
                정답 문서 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>정답 문서 추가</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="상품명으로 검색..."
                    className="flex-1"
                  />
                  <Button size="sm" disabled={!searchTerm.trim()}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                {productsQuery.data && productsQuery.data.length > 0 && (
                  <div className="max-h-64 overflow-y-auto border rounded-lg">
                    {productsQuery.data.map((product: EvaluationProduct) => (
                      <div
                        key={product.id}
                        className={`p-3 cursor-pointer border-b last:border-b-0 hover:bg-gray-50 ${
                          selectedProduct?.id === product.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => setSelectedProduct(product)}
                      >
                        <div className="font-medium text-sm">{product.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          브랜드: {product.brand} | ID: {product.id}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowProductDialog(false)}>
                    취소
                  </Button>
                  <Button 
                    onClick={handleAddProduct}
                    disabled={addDocumentMutation.isPending || !selectedProduct}
                  >
                    {addDocumentMutation.isPending ? '추가중...' : '추가'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 데이터 테이블 */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-16 text-center">순번</TableHead>
              <TableHead className="w-32">상품 ID</TableHead>
              <TableHead>상품명</TableHead>
              <TableHead className="w-32 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>평가 상태</span>
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
                const status = getEvaluationStatus(doc.relevanceStatus)
                const isExpanded = expandedDocument === doc.productId
                
                return (
                  <React.Fragment key={doc.productId}>
                    <TableRow 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleExpand(doc.productId)}
                    >
                      <TableCell className="text-center font-medium text-gray-600">
                        {(currentPage * 10) + index + 1}
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {doc.productId}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-900">
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
                      
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          {getStatusBadge(status)}
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

                                {/* 평가 상태 선택 */}
                                <div className="mb-6">
                                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                                    🏷️ 평가 상태 *
                                  </label>
                                                    <Select 
                    value={editForm.relevanceStatus === 'RELEVANT' ? 'correct' : editForm.relevanceStatus === 'IRRELEVANT' ? 'incorrect' : 'unspecified'}
                                                        onValueChange={(value) => {
                      let newStatus: RelevanceStatus = 'UNSPECIFIED'
                      if (value === 'correct') newStatus = 'RELEVANT'
                      else if (value === 'incorrect') newStatus = 'IRRELEVANT'
                      setEditForm({ ...editForm, relevanceStatus: newStatus })
                    }}
                                  >
                                    <SelectTrigger className="w-48">
                                      <SelectValue placeholder="평가 상태 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="correct">
                                        <div className="flex items-center gap-2">
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                          정답
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="incorrect">
                                        <div className="flex items-center gap-2">
                                          <XCircle className="h-4 w-4 text-red-600" />
                                          오답
                                        </div>
                                      </SelectItem>
                                                            <SelectItem value="unspecified">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-gray-600" />
                          미지정
                        </div>
                      </SelectItem>
                                    </SelectContent>
                                  </Select>
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

                                {/* 현재 평가 상태 표시 */}
                                <div className="mb-6">
                                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                                    🏷️ 평가 상태
                                  </label>
                                  <div className="flex items-center">
                                    {getStatusBadge(status)}
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
        <div className="flex justify-center items-center gap-1 mt-4 pt-3 border-t border-gray-100">
          {/* 처음 */}
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage <= 0}
            onClick={() => onPageChange(0)}
            className="h-8 px-2 text-xs"
          >
            <ChevronsLeft className="h-3 w-3 mr-1" />
            처음
          </Button>

          {/* 이전 */}
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage <= 0}
            onClick={() => onPageChange(currentPage - 1)}
            className="h-8 px-2 text-xs"
          >
            <ChevronLeft className="h-3 w-3 mr-1" />
            이전
          </Button>

          {/* 페이지 번호들 */}
          {(() => {
            const maxVisible = 5 // 최대 5개 페이지 번호 표시
            let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2))
            const endPage = Math.min(totalPages - 1, startPage + maxVisible - 1)
            
            // 끝에서 역산하여 시작 페이지 조정
            if (endPage - startPage + 1 < maxVisible) {
              startPage = Math.max(0, endPage - maxVisible + 1)
            }

            const pages = []
            
            // 첫 페이지가 범위에 없으면 첫 페이지와 ... 추가
            if (startPage > 0) {
              pages.push(
                <Button 
                  key={0}
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(0)}
                  className="h-8 px-3 text-xs min-w-[32px]"
                >
                  1
                </Button>
              )
              if (startPage > 1) {
                pages.push(
                  <span key="start-ellipsis" className="px-2 text-xs text-gray-400">...</span>
                )
              }
            }

            // 중간 페이지들
            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <Button 
                  key={i}
                  variant={i === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(i)}
                  className="h-8 px-3 text-xs min-w-[32px]"
                >
                  {i + 1}
                </Button>
              )
            }

            // 마지막 페이지가 범위에 없으면 ... 과 마지막 페이지 추가
            if (endPage < totalPages - 1) {
              if (endPage < totalPages - 2) {
                pages.push(
                  <span key="end-ellipsis" className="px-2 text-xs text-gray-400">...</span>
                )
              }
              pages.push(
                <Button 
                  key={totalPages - 1}
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(totalPages - 1)}
                  className="h-8 px-3 text-xs min-w-[32px]"
                >
                  {totalPages}
                </Button>
              )
            }

            return pages
          })()}

          {/* 다음 */}
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage >= totalPages - 1}
            onClick={() => onPageChange(currentPage + 1)}
            className="h-8 px-2 text-xs"
          >
            다음
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>

          {/* 끝 */}
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage >= totalPages - 1}
            onClick={() => onPageChange(totalPages - 1)}
            className="h-8 px-2 text-xs"
          >
            끝
            <ChevronsRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
} 