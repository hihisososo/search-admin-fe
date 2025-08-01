import { memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, RefreshCw } from 'lucide-react'
import { ko } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'

interface DashboardHeaderProps {
  selectedIndex: string
  setSelectedIndex: (value: string) => void
  dateRange: DateRange
  setDateRange: (value: DateRange) => void
  onRefresh: () => void
  loading: boolean
  lastUpdated: Date
}

const INDEX_LIST = ['전체', 'test-1', 'test-2', 'test-3', 'test-4', 'test-5'] as const

const formatDateRange = (dateRange: DateRange): string => {
  if (!dateRange.from || !dateRange.to) return '날짜 범위 선택'
  
  const formatOptions = { month: '2-digit', day: '2-digit' } as const
  const fromDate = dateRange.from.toLocaleDateString('ko-KR', formatOptions)
  const toDate = dateRange.to.toLocaleDateString('ko-KR', formatOptions)
  
  return `${fromDate} ~ ${toDate}`
}

export default memo(function DashboardHeader({
  selectedIndex,
  setSelectedIndex,
  dateRange,
  setDateRange,
  onRefresh,
  loading,
}: DashboardHeaderProps) {
  const handleDateRange = useCallback((value: DateRange | undefined) => {
    setDateRange(value || { from: undefined, to: undefined })
  }, [setDateRange])

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-700">인덱스:</span>
        <Select value={selectedIndex} onValueChange={setSelectedIndex}>
          <SelectTrigger className="w-32 hover:bg-blue-50 hover:border-blue-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {INDEX_LIST.map((index) => (
              <SelectItem key={index} value={index}>
                {index}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 text-sm font-normal hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
          >
            <CalendarIcon className="h-4 w-4" />
            {formatDateRange(dateRange)}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="p-0 w-auto">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleDateRange}
            numberOfMonths={2}
            locale={ko}
            className="border-0"
          />
        </PopoverContent>
      </Popover>

      <Button
        onClick={onRefresh}
        disabled={loading}
        variant="outline"
        size="sm"
        className="hover:bg-blue-50 hover:border-blue-300"
      >
        <RefreshCw className={loading ? 'animate-spin' : ''} />
        새로고침
      </Button>
    </div>
  )
})