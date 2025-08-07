import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface DictionaryPaginationProps {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
}

export function DictionaryPagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange
}: DictionaryPaginationProps) {
  const startIndex = (currentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems)
  
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
      <div className="text-sm text-gray-700">
        전체 {totalItems}개 중 {startIndex}-{endIndex}개 표시
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">페이지당:</span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => onItemsPerPageChange(Number(value))}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
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