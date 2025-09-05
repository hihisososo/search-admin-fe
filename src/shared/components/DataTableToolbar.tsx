import { useEffect, useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PAGINATION } from "@/constants/pagination"
import { Search } from "lucide-react"
import { morphemeAnalysisService } from '@/services'
import { useDebounce } from '@/hooks/useDebounce'

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
  pageSizeOptions?: ReadonlyArray<number>
  className?: string
  disabled?: boolean
  leftMessage?: React.ReactNode
  showMorphemeAnalysis?: boolean // 형태소 분석 표시 여부
  environment?: string // 형태소 분석 환경
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
  leftMessage,
  showMorphemeAnalysis = true, // 기본적으로 활성화
  environment = 'CURRENT', // 기본값 CURRENT
}: DataTableToolbarProps) {
  const [tokens, setTokens] = useState<string[]>([])
  
  // 디바운싱된 검색어
  const debouncedSearchValue = useDebounce(searchValue, 300)

  // 형태소 분석 실행
  const analyzeMorpheme = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setTokens([])
      return
    }
    
    try {
      const result = await morphemeAnalysisService.analyzeQuery({
        query: query.trim(),
        environment: environment
      })
      setTokens(result.tokens || [])
    } catch (error) {
      console.error('형태소 분석 실패:', error)
      setTokens([])
    }
  }, [environment])

  // 검색어 변경 시 형태소 분석
  useEffect(() => {
    if (showMorphemeAnalysis && debouncedSearchValue) {
      analyzeMorpheme(debouncedSearchValue)
    } else {
      setTokens([])
    }
  }, [debouncedSearchValue, showMorphemeAnalysis, analyzeMorpheme])

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.()
    }
  }

  return (
    <div className={`flex items-center justify-between mb-2 ${className}`}>
      <div className="flex items-center gap-2 flex-1">
        {leftMessage}
        {showSearch && (
          <div className="flex items-center gap-2 max-w-2xl">
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-96 text-sm" // w-96으로 늘림
            />
            <Button onClick={onSearch} disabled={disabled} size="icon" variant="outline" className="w-9" aria-label="검색">
              <Search className="w-4 h-4" />
            </Button>
            
            {/* 형태소 분석 토큰 표시 */}
            {showMorphemeAnalysis && tokens.length > 0 && (
              <div className="flex items-center gap-1 ml-2">
                <span className="text-[11px] text-gray-500">분석결과:</span>
                <span className="text-[11px] text-gray-400">
                  {tokens.join(', ')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="text-xs text-gray-500">
          전체 {Number(totalCount || 0).toLocaleString()}건 (페이지 {currentPage + 1}/{Math.max(totalPages || 1, 1)})
        </div>
        <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger className="w-24 text-xs">
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