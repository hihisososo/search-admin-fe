import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  maxVisiblePages?: number
  showFirstLast?: boolean
  size?: "sm" | "default"
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 10,
  showFirstLast = true,
  size = "sm"
}: PaginationProps) {
  if (totalPages <= 1) return null

  const buttonSizeClasses = size === "sm" ? "h-7 px-2 min-w-[28px]" : "h-8 px-2 min-w-[32px]"
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4"
  
  // 페이지 번호 계산
  const halfWindow = Math.floor(maxVisiblePages / 2)
  let startPage = Math.max(1, currentPage - halfWindow)
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  const renderPageNumbers = () => {
    const pages = []
    
    // 중간 페이지들만 표시 (최대 10개)
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button 
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(i)}
          className={`${buttonSizeClasses} border-gray-300`}
        >
          {i}
        </Button>
      )
    }

    return pages
  }

  return (
    <div className="flex items-center gap-1">
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-7 px-2 border-gray-300"
          title="처음 페이지"
        >
          <ChevronsLeft className={iconSize} />
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-7 px-2 border-gray-300"
        title="이전 페이지"
      >
        <ChevronLeft className={iconSize} />
      </Button>
      
      {renderPageNumbers()}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-7 px-2 border-gray-300"
        title="다음 페이지"
      >
        <ChevronRight className={iconSize} />
      </Button>
      
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-7 px-2 border-gray-300"
          title="마지막 페이지"
        >
          <ChevronsRight className={iconSize} />
        </Button>
      )}
    </div>
  )
}