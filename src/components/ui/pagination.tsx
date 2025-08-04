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

    const startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, currentPage + 2)

    return (
        <div className="flex justify-center items-center gap-2 mt-6">
            <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                이전
            </Button>
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
                <Button 
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
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
                        onClick={() => onPageChange(totalPages)}
                    >
                        {totalPages}
                    </Button>
                </>
            )}
            <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                다음
            </Button>
        </div>
    )
} 