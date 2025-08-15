import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PAGINATION } from "@/constants/pagination"

interface DataTableToolbarProps {
  showSearch?: boolean
  searchValue?: string
  onSearchChange?: (value: string) => void
  onSearch?: () => void
  searchPlaceholder?: string
  totalCount?: number
  currentPage?: number // 0-based
  totalPages?: number
  pageSize: number
  onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
  className?: string
  disabled?: boolean
}

export function DataTableToolbar({
  showSearch = false,
  searchValue = "",
  onSearchChange,
  onSearch,
  searchPlaceholder = "검색어를 입력하세요",
  totalCount = 0,
  currentPage = 0,
  totalPages = 1,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = PAGINATION.AVAILABLE_PAGE_SIZES,
  className = "",
  disabled = false,
}: DataTableToolbarProps) {
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.()
    }
  }

  return (
    <div className={`flex items-center justify-between mb-2 ${className}`}>
      <div className="flex items-center gap-2 w-full max-w-lg">
        {showSearch && (
          <>
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="h-9 flex-1 text-sm"
            />
            <Button onClick={onSearch} disabled={disabled} className="h-9 px-4">
              검색
            </Button>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="text-xs text-gray-500">
          전체 {Number(totalCount || 0).toLocaleString()}건 (페이지 {currentPage + 1}/{Math.max(totalPages || 1, 1)})
        </div>
        <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger className="w-24 h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="text-xs">
            {pageSizeOptions.map(size => (
              <SelectItem key={size} value={size.toString()} className="text-xs py-1">
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}


