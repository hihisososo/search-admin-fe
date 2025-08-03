import { memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, RefreshCw } from 'lucide-react'
import { ko } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'

interface DashboardHeaderProps {
  dateRange: DateRange
  setDateRange: (value: DateRange) => void
  onRefresh: () => void
  loading: boolean
  lastUpdated: Date
}

const formatDateRange = (dateRange: DateRange): string => {
  if (!dateRange.from || !dateRange.to) return '날짜 범위 선택'
  
  const formatOptions = { month: '2-digit', day: '2-digit' } as const
  const fromDate = dateRange.from.toLocaleDateString('ko-KR', formatOptions)
  const toDate = dateRange.to.toLocaleDateString('ko-KR', formatOptions)
  
  return `${fromDate} ~ ${toDate}`
}

export default memo(function DashboardHeader({
  dateRange,
  setDateRange,
  onRefresh,
  loading,
}: DashboardHeaderProps) {
  const handleDateRange = useCallback((value: DateRange | undefined) => {
    setDateRange(value || { from: undefined, to: undefined })
  }, [setDateRange])

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold">대시보드</h1>
      
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-9 px-3 text-sm"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
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
          className="h-9 px-3"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  )
})