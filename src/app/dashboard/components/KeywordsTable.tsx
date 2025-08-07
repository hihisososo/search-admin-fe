import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { TopKeyword } from '../hooks/use-dashboard-transformers'

interface KeywordsTableProps {
  keywords: TopKeyword[]
  loading: boolean
  title?: string
  type?: 'popular' | 'trending'
}

const TrendIcon = memo(({ trend }: { trend: TopKeyword['trend'] }) => {
  switch (trend) {
    case 'up':
      return (
        <div className="flex items-center justify-center">
          <TrendingUp className="h-3.5 w-3.5 text-green-600" />
        </div>
      )
    case 'down':
      return (
        <div className="flex items-center justify-center">
          <TrendingDown className="h-3.5 w-3.5 text-red-600" />
        </div>
      )
    case 'new':
      return (
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            NEW
          </span>
        </div>
      )
    case 'stable':
      return (
        <div className="flex items-center justify-center">
          <Minus className="h-3.5 w-3.5 text-gray-400" />
        </div>
      )
    default:
      return (
        <div className="flex items-center justify-center">
          <span className="text-gray-400">-</span>
        </div>
      )
  }
})

TrendIcon.displayName = 'TrendIcon'

const KeywordTableSkeleton = memo(() => (
  <>
    {Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <Skeleton className="h-4 w-4" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-16" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-12" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-3 w-3" />
        </TableCell>
      </TableRow>
    ))}
  </>
))

KeywordTableSkeleton.displayName = 'KeywordTableSkeleton'

export default memo(function KeywordsTable({ 
  keywords, 
  loading,
  title = '인기 검색 키워드 TOP 10',
  type = 'popular'
}: KeywordsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {type === 'popular' ? (
              <>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>상승</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span>하락</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>신규</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span>급상승</span>
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-12 py-2 text-xs font-semibold text-gray-700 text-center">순위</TableHead>
              <TableHead className="py-2 text-xs font-semibold text-gray-700">키워드</TableHead>
              <TableHead className="py-2 text-xs font-semibold text-gray-700 text-center">검색량</TableHead>
              <TableHead className="py-2 text-xs font-semibold text-gray-700 text-center">비율</TableHead>
              <TableHead className="py-2 text-xs font-semibold text-gray-700 text-center">CTR</TableHead>
              <TableHead className="w-16 py-2 text-xs font-semibold text-gray-700 text-center">추세</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <KeywordTableSkeleton />
            ) : keywords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  데이터 없음
                </TableCell>
              </TableRow>
            ) : (
              keywords.slice(0, 10).map((keyword, index) => (
                <TableRow key={keyword.keyword} className="hover:bg-gray-50">
                  <TableCell className="text-center font-medium">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                      type === 'popular' ? (
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-50 text-gray-600'
                      ) : (
                        index < 3 ? 'bg-orange-100 text-orange-700 font-semibold' :
                        'bg-gray-50 text-gray-600'
                      )
                    }`}>
                      {index + 1}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-left">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[200px]" title={keyword.keyword}>
                        {keyword.keyword}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {keyword.searches.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {keyword.percentage ? `${keyword.percentage.toFixed(1)}%` : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-medium ${
                      parseFloat(keyword.ctr) > 5 ? 'text-green-600' : 
                      parseFloat(keyword.ctr) > 2 ? 'text-yellow-600' : 
                      'text-gray-500'
                    }`}>
                      {keyword.ctr}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <TrendIcon trend={keyword.trend} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
})