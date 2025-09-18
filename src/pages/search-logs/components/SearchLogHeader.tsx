import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, RotateCcw } from "lucide-react"

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
  indexName: _indexName,
  isError,
  clientIp,
  startDate,
  endDate,
  minResponseTime,
  maxResponseTime,
  minResultCount,
  maxResultCount,
  onKeywordChange,
  onIndexNameChange: _onIndexNameChange,
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
  
  // datetime-local 값을 항상 초 단위까지 맞춤
  const normalizeDatetimeLocal = (value: string) => {
    if (!value) return ""
    // value: YYYY-MM-DDTHH:MM 또는 YYYY-MM-DDTHH:MM:SS
    return value.length === 16 ? `${value}:00` : value
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
        <div className="w-60 space-y-1">
          <label className="text-sm font-medium text-gray-700">시작 일시</label>
          <Input
            type="datetime-local"
            step={1}
            value={startDate || ""}
            onChange={(e) => onStartDateChange(normalizeDatetimeLocal(e.target.value))}
            className="h-8 text-sm"
          />
        </div>
        <div className="w-60 space-y-1">
          <label className="text-sm font-medium text-gray-700">종료 일시</label>
          <Input
            type="datetime-local"
            step={1}
            value={endDate || ""}
            onChange={(e) => onEndDateChange(normalizeDatetimeLocal(e.target.value))}
            className="h-8 text-sm"
          />
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
        <Button onClick={onSearch} size="sm" variant="outline" className="h-8 px-3 text-sm">
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