import { memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { ko } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'

interface DashboardHeaderProps {
  dateRange: DateRange
  setDateRange: (value: DateRange) => void
  onRefresh?: () => void
  loading?: boolean
  lastUpdated?: Date
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
}: DashboardHeaderProps) {
  const handleDateRange = useCallback((value: DateRange | undefined) => {
    setDateRange(value || { from: undefined, to: undefined })
  }, [setDateRange])

  return (
    <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">날짜 선택 :</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="default"
              className="h-9 px-4 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span className="font-medium text-sm">{formatDateRange(dateRange)}</span>
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
              disabled={(date) => date > new Date()}
              toDate={new Date()}
            />
          </PopoverContent>
        </Popover>
    </div>
  )
})