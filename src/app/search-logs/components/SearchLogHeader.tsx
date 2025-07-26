import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Search, RotateCcw, CalendarIcon } from "lucide-react"
import { ko } from "date-fns/locale"
import type { SearchLogFilterOptions } from "@/types/dashboard"

interface SearchLogHeaderProps {
  keyword: string
  indexName: string
  isError: boolean | undefined
  clientIp: string
  startDate: string
  endDate: string
  minResponseTime: number | undefined
  maxResponseTime: number | undefined
  minResultCount: number | undefined
  maxResultCount: number | undefined
  filterOptions: SearchLogFilterOptions | null
  onKeywordChange: (value: string) => void
  onIndexNameChange: (value: string) => void
  onIsErrorChange: (value: boolean | undefined) => void
  onClientIpChange: (value: string) => void
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onMinResponseTimeChange: (value: number | undefined) => void
  onMaxResponseTimeChange: (value: number | undefined) => void
  onMinResultCountChange: (value: number | undefined) => void
  onMaxResultCountChange: (value: number | undefined) => void
  onSearch: () => void
  onResetFilters: () => void
}

export function SearchLogHeader({
  keyword,
  indexName,
  isError,
  clientIp,
  startDate,
  endDate,
  minResponseTime,
  maxResponseTime,
  minResultCount,
  maxResultCount,
  filterOptions,
  onKeywordChange,
  onIndexNameChange,
  onIsErrorChange,
  onClientIpChange,
  onStartDateChange,
  onEndDateChange,
  onMinResponseTimeChange,
  onMaxResponseTimeChange,
  onMinResultCountChange,
  onMaxResultCountChange,
  onSearch,
  onResetFilters
}: SearchLogHeaderProps) {
  
  // 날짜 입력값을 API 형식으로 변환
  const formatDateForApi = (dateStr: string, isEndDate = false) => {
    if (!dateStr) return ""
    return isEndDate ? `${dateStr}T23:59:59` : `${dateStr}T00:00:00`
  }

  // 숫자 입력 처리
  const handleNumberChange = (value: string, setter: (val: number | undefined) => void) => {
    const num = value === "" ? undefined : parseInt(value)
    setter(num)
  }

  return (
    <div className="space-y-2">
      {/* 첫 번째 행: 키워드, 날짜, 클라이언트 IP */}
      <div className="flex flex-wrap gap-3">
        <div className="w-80 space-y-1">
          <label className="text-sm font-medium text-gray-700">검색 키워드</label>
          <Input
            placeholder="키워드"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="h-8 text-sm placeholder:text-sm"
          />
        </div>
        <div className="w-44 space-y-1">
          <label className="text-sm font-medium text-gray-700">시작 날짜</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-8 text-sm justify-start font-normal"
              >
                <CalendarIcon className="w-4 h-4 mr-1" />
                {startDate ? new Date(startDate).toLocaleDateString('ko-KR') : "선택"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate ? new Date(startDate) : undefined}
                onSelect={(date) => onStartDateChange(date ? formatDateForApi(date.toISOString().split('T')[0]) : "")}
                locale={ko}
                className="border-0"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="w-44 space-y-1">
          <label className="text-sm font-medium text-gray-700">종료 날짜</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-8 text-sm justify-start font-normal"
              >
                <CalendarIcon className="w-4 h-4 mr-1" />
                {endDate ? new Date(endDate).toLocaleDateString('ko-KR') : "선택"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate ? new Date(endDate) : undefined}
                onSelect={(date) => onEndDateChange(date ? formatDateForApi(date.toISOString().split('T')[0], true) : "")}
                locale={ko}
                className="border-0"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="w-60 space-y-1">
          <label className="text-sm font-medium text-gray-700">클라이언트 IP</label>
          <Input
            placeholder="IP"
            value={clientIp}
            onChange={(e) => onClientIpChange(e.target.value)}
            className="h-8 text-sm placeholder:text-sm"
          />
        </div>
      </div>

      {/* 두 번째 행: 에러여부, 숫자 범위들 */}
      <div className="flex flex-wrap gap-3">
        <div className="w-28 space-y-1">
          <label className="text-sm font-medium text-gray-700">에러여부</label>
          <Select value={isError === undefined ? "all" : isError.toString()} onValueChange={(value) => onIsErrorChange(value === "all" ? undefined : value === "true")}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent className="text-sm">
              <SelectItem value="all" className="text-sm py-1">전체</SelectItem>
              <SelectItem value="false" className="text-sm py-1">정상</SelectItem>
              <SelectItem value="true" className="text-sm py-1">에러</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">결과수</label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="최소"
              value={minResultCount ?? ""}
              onChange={(e) => handleNumberChange(e.target.value, onMinResultCountChange)}
              className="h-8 text-sm placeholder:text-sm w-24"
            />
            <span className="text-sm text-gray-400">~</span>
            <Input
              type="number"
              placeholder="최대"
              value={maxResultCount ?? ""}
              onChange={(e) => handleNumberChange(e.target.value, onMaxResultCountChange)}
              className="h-8 text-sm placeholder:text-sm w-24"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">응답시간 (ms)</label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="최소"
              value={minResponseTime ?? ""}
              onChange={(e) => handleNumberChange(e.target.value, onMinResponseTimeChange)}
              className="h-8 text-sm placeholder:text-sm w-24"
            />
            <span className="text-sm text-gray-400">~</span>
            <Input
              type="number"
              placeholder="최대"
              value={maxResponseTime ?? ""}
              onChange={(e) => handleNumberChange(e.target.value, onMaxResponseTimeChange)}
              className="h-8 text-sm placeholder:text-sm w-24"
            />
          </div>
        </div>
      </div>

      {/* 세 번째 행: 버튼들 */}
      <div className="flex gap-2 mt-5">
        <Button onClick={onSearch} size="sm" className="h-8 px-3 text-sm">
          <Search className="w-4 h-4 mr-1" />
          검색
        </Button>
        <Button 
          onClick={onResetFilters} 
          variant="outline" 
          size="sm" 
          className="h-8 px-3 text-sm"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          초기화
        </Button>
      </div>
    </div>
  )
} 