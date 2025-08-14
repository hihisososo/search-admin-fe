import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { calculatePaginationRange } from "@/utils/evaluation-helpers"
import { PAGINATION } from "@/constants/pagination"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange
}: PaginationControlsProps) {
  // 항상 표시되도록 변경 (단일 페이지여도 노출)

  const { startPage, endPage } = calculatePaginationRange(
    currentPage, 
    totalPages, 
    PAGINATION.MAX_VISIBLE_PAGES
  )

  const renderPageNumbers = () => {
    const pages = []
    
    // 중간 페이지들만 표시
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

    return pages
  }

  return (
    <>
      {/* 상단: 총 건수/페이지 정보 + 페이지당 출력 수 (왼쪽) */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-gray-500">
          전체 {totalCount.toLocaleString()}건 (페이지 {currentPage + 1}/{Math.max(totalPages, 1)})
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">페이지당</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-7 text-xs border border-gray-300 rounded px-2 bg-white"
          >
            {PAGINATION.AVAILABLE_PAGE_SIZES.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 페이지네이션 버튼들 */}
      <div className="flex justify-center items-center gap-1 mt-2">
        {/* 처음 */}
        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPage <= 0}
          onClick={() => onPageChange(0)}
          className="h-8 px-2 text-xs"
        >
          <ChevronsLeft className="h-3 w-3" />
        </Button>

        {/* 이전 */}
        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPage <= 0}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 px-2 text-xs"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>

        {/* 페이지 번호들 */}
        {renderPageNumbers()}

        {/* 다음 */}
        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 px-2 text-xs"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>

        {/* 끝 */}
        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(totalPages - 1)}
          className="h-8 px-2 text-xs"
        >
          <ChevronsRight className="h-3 w-3" />
        </Button>
      </div>
    </>
  )
} 