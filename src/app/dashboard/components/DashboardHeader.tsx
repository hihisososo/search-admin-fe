import { memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, RefreshCw, Activity, TrendingUp } from 'lucide-react'
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
  lastUpdated,
}: DashboardHeaderProps) {
  const handleDateRange = useCallback((value: DateRange | undefined) => {
    setDateRange(value || { from: undefined, to: undefined })
  }, [setDateRange])

  return (
    <div className="space-y-6">
      {/* 타이틀 섹션 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg">
              <Activity className="h-6 w-6" />
            </div>
            검색 대시보드
          </h1>
          <p className="mt-2 text-gray-600 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            실시간 검색 분석 및 성능 모니터링
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all duration-200"
              >
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-700">{formatDateRange(dateRange)}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 w-auto shadow-xl border-gray-200">
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
            size="default"
            className="bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all duration-200"
          >
            <RefreshCw className={`h-4 w-4 mr-2 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            <span className="font-medium text-gray-700">새로고침</span>
          </Button>
        </div>
      </div>

      {/* 업데이트 정보 */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          <span>실시간 데이터 수집 중</span>
        </div>
        <span>마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}</span>
      </div>
    </div>
  )
})