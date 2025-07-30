import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { calculatePaginationRange } from "@/utils/evaluation-helpers"
import { EVALUATION_CONFIG } from "@/constants/evaluation"

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
  totalCount: _totalCount,
  pageSize: _pageSize,
  onPageChange,
  onPageSizeChange: _onPageSizeChange
}: PaginationControlsProps) {
  if (totalPages <= 1) return null

  const { startPage, endPage } = calculatePaginationRange(
    currentPage, 
    totalPages, 
    EVALUATION_CONFIG.MAX_VISIBLE_PAGINATION_PAGES
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
      {/* 페이지네이션 */}
      <div className="flex justify-center items-center gap-1 mt-4 pt-3 border-t border-gray-100">
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