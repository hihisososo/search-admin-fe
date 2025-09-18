import type { Dispatch, SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { ko } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'

interface DashboardHeaderProps {
  dateRange: DateRange
  setDateRange: Dispatch<SetStateAction<DateRange>>
}

export default function DashboardHeader({ dateRange, setDateRange }: DashboardHeaderProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className="h-9 px-4 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          <span className="font-medium text-sm">
            {dateRange.from && dateRange.to
              ? `${dateRange.from.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })} ~ ${dateRange.to.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}`
              : '날짜 범위 선택'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0 w-auto">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={(value) => setDateRange(value || { from: undefined, to: undefined })}
          numberOfMonths={2}
          locale={ko}
          className="border-0"
          disabled={(date) => date > new Date()}
          toDate={new Date()}
        />
      </PopoverContent>
    </Popover>
  )
}
