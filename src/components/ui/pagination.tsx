import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationProps {
    currentPage: number
    totalPages: number
    totalItems?: number
    itemsPerPage?: number
    onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null

    // 페이지 번호를 표시용으로 1부터 시작하도록 변환
    const displayPage = currentPage + 1
    
    // 최대 10개의 페이지 번호 표시
    const maxVisiblePages = 10
    const halfWindow = Math.floor(maxVisiblePages / 2)
    let startPage = Math.max(1, displayPage - halfWindow)
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    return (
        <div className="flex justify-center items-center gap-1 mt-6">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(0)}
                disabled={currentPage <= 0}
                className="h-7 px-2 border-gray-300"
                title="처음 페이지"
            >
                <ChevronsLeft className="h-3 w-3" />
            </Button>
            <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage <= 0}
                onClick={() => onPageChange(currentPage - 1)}
                className="h-7 px-2 border-gray-300"
                title="이전 페이지"
            >
                <ChevronLeft className="h-3 w-3" />
            </Button>
            
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
                <Button 
                    key={pageNum}
                    variant={pageNum === displayPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum - 1)}
                    className="h-7 px-2 min-w-[28px] border-gray-300"
                >
                    {pageNum}
                </Button>
            ))}
            
            <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage >= totalPages - 1}
                onClick={() => onPageChange(currentPage + 1)}
                className="h-7 px-2 border-gray-300"
                title="다음 페이지"
            >
                <ChevronRight className="h-3 w-3" />
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
                className="h-7 px-2 border-gray-300"
                title="마지막 페이지"
            >
                <ChevronsRight className="h-3 w-3" />
            </Button>
        </div>
    )
} 