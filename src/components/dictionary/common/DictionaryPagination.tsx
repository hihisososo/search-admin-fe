import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface DictionaryPaginationProps {
  currentPage: number // 1-based (레거시 컴포넌트)
  totalPages: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void // expects 1-based
  onItemsPerPageChange: (items: number) => void
}

export function DictionaryPagination({
  currentPage,
  totalPages,
  itemsPerPage: _itemsPerPage,
  totalItems: _totalItems,
  onPageChange,
  onItemsPerPageChange: _onItemsPerPageChange
}: DictionaryPaginationProps) {
  const startIndex = 0
  const endIndex = 0
  
  // 최대 10개의 페이지 번호 표시
  const maxVisiblePages = 10
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
          className="h-7 px-2 min-w-[28px] border-gray-300"
        >
          {i}
        </Button>
      )
    }

    return pages
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-7 px-2 border-gray-300"
            title="처음 페이지"
          >
            <ChevronsLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-7 px-2 border-gray-300"
            title="이전 페이지"
          >
            <ChevronLeft className="h-3 w-3" />
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
            <ChevronRight className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-7 px-2 border-gray-300"
            title="마지막 페이지"
          >
            <ChevronsRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}