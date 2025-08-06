import { Button } from "@/components/ui/button"

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
    const startPage = Math.max(1, displayPage - 2)
    const endPage = Math.min(totalPages, displayPage + 2)

    return (
        <div className="flex justify-center items-center gap-2 mt-6">
            <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage <= 0}
                onClick={() => onPageChange(currentPage - 1)}
            >
                이전
            </Button>
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
                <Button 
                    key={pageNum}
                    variant={pageNum === displayPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum - 1)}
                >
                    {pageNum}
                </Button>
            ))}
            {endPage < totalPages && (
                <>
                    <span className="mx-2 text-muted-foreground">...</span>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onPageChange(totalPages - 1)}
                    >
                        {totalPages}
                    </Button>
                </>
            )}
            <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage >= totalPages - 1}
                onClick={() => onPageChange(currentPage + 1)}
            >
                다음
            </Button>
        </div>
    )
} 