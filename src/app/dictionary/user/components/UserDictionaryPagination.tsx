import { memo } from 'react'
import { Button } from '@/components/ui/button'

interface UserDictionaryPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const UserDictionaryPagination = memo(
  ({ page, totalPages, onPageChange }: UserDictionaryPaginationProps) => {
    const startPage = Math.max(1, page - 2)
    const endPage = Math.min(totalPages, page + 2)

    return (
      <div className="flex justify-center items-center gap-1 mt-4 pt-4 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-7 px-2 text-xs"
        >
          이전
        </Button>
        
        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(
          (pageNum) => (
            <Button
              key={pageNum}
              variant={pageNum === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className="h-7 px-2 text-xs min-w-[28px]"
            >
              {pageNum}
            </Button>
          )
        )}
        
        {endPage < totalPages && (
          <>
            <span className="mx-1 text-xs text-gray-400">...</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              className="h-7 px-2 text-xs"
            >
              {totalPages}
            </Button>
          </>
        )}
        
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-7 px-2 text-xs"
        >
          다음
        </Button>
      </div>
    )
  }
)

UserDictionaryPagination.displayName = 'UserDictionaryPagination'