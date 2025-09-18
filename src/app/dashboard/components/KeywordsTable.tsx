import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface TopKeyword {
  keyword: string
  searches: number
  ctr: string
  trend: 'up' | 'down' | 'stable' | 'new'
  percentage?: number
  rank?: number
}

interface KeywordsTableProps {
  keywords: TopKeyword[]
  loading: boolean
  title?: string
  type?: 'popular' | 'trending'
}

const CTR_THRESHOLDS = {
  HIGH: 5,
  MEDIUM: 2
} as const

const RANK_STYLES = {
  popular: [
    'bg-yellow-100 text-yellow-800',
    'bg-gray-100 text-gray-800',
    'bg-orange-100 text-orange-800'
  ],
  trending: 'bg-orange-100 text-orange-700 font-semibold',
  default: 'bg-gray-50 text-gray-600'
} as const

const LEGEND_ITEMS = {
  popular: [
    { color: 'bg-green-500', label: '상승' },
    { color: 'bg-red-500', label: '하락' },
    { color: 'bg-blue-500', label: '신규' }
  ],
  trending: [
    { color: 'bg-orange-500', label: '급상승' }
  ]
} as const

const TREND_ICONS = {
  up: <TrendingUp className="h-3.5 w-3.5 text-green-600" />,
  down: <TrendingDown className="h-3.5 w-3.5 text-red-600" />,
  new: <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">NEW</span>,
  stable: <Minus className="h-3.5 w-3.5 text-gray-400" />
} as const

const TrendIcon = memo(({ trend }: { trend: TopKeyword['trend'] }) => (
  <div className="flex items-center justify-center">
    {TREND_ICONS[trend] || <span className="text-gray-400">-</span>}
  </div>
))

TrendIcon.displayName = 'TrendIcon'

export default memo(function KeywordsTableRefactored({
  keywords,
  loading,
  title = '인기 검색 키워드 TOP 10',
  type = 'popular'
}: KeywordsTableProps) {

  const getRankStyle = (index: number): string => {
    if (type === 'popular') {
      return index < 3 ? RANK_STYLES.popular[index] : RANK_STYLES.default
    }
    return index < 3 ? RANK_STYLES.trending : RANK_STYLES.default
  }

  const getCTRColor = (ctr: string): string => {
    const value = parseFloat(ctr)
    if (value > CTR_THRESHOLDS.HIGH) return 'text-green-600'
    if (value > CTR_THRESHOLDS.MEDIUM) return 'text-yellow-600'
    return 'text-gray-500'
  }

  const displayKeywords = keywords.slice(0, 10)

  return (
    <Card>
      <CardHeader className="pb-2 pt-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {LEGEND_ITEMS[type].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <span className={`w-2 h-2 ${color} rounded-full`} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        ) : displayKeywords.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">데이터 없음</div>
          </div>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="py-2 text-xs font-semibold text-gray-700 text-center w-12">
                    순위
                  </TableHead>
                  <TableHead className="py-2 text-xs font-semibold text-gray-700 text-left">
                    키워드
                  </TableHead>
                  <TableHead className="py-2 text-xs font-semibold text-gray-700 text-center">
                    검색량
                  </TableHead>
                  <TableHead className="py-2 text-xs font-semibold text-gray-700 text-center">
                    비율
                  </TableHead>
                  <TableHead className="py-2 text-xs font-semibold text-gray-700 text-center">
                    CTR
                  </TableHead>
                  <TableHead className="py-2 text-xs font-semibold text-gray-700 text-center w-16">
                    추세
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayKeywords.map((item, index) => (
                  <TableRow key={item.keyword} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="py-2 px-3 text-xs text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${getRankStyle(index)}`}>
                        {index + 1}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 px-3 text-xs text-left">
                      <span className="truncate max-w-[200px] font-medium" title={item.keyword}>
                        {item.keyword}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 px-3 text-xs text-center">
                      <span className="font-medium">{item.searches.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="py-2 px-3 text-xs text-center">
                      <span className="text-muted-foreground">
                        {item.percentage ? `${item.percentage.toFixed(1)}%` : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 px-3 text-xs text-center">
                      <span className={`font-medium ${getCTRColor(item.ctr)}`}>
                        {item.ctr}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 px-3 text-xs text-center">
                      <TrendIcon trend={item.trend} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
})