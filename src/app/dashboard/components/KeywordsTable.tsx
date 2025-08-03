import { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { TopKeyword } from '../hooks/use-dashboard-transformers'

interface KeywordsTableProps {
  keywords: TopKeyword[]
  loading: boolean
}

const TrendIcon = memo(({ trend }: { trend: TopKeyword['trend'] }) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-3 w-3 text-green-600" />
    case 'down':
      return <TrendingDown className="h-3 w-3 text-red-600" />
    case 'stable':
      return <Minus className="h-3 w-3 text-gray-400" />
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

export default memo(function KeywordsTable({ keywords, loading }: KeywordsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">인기 검색 키워드</CardTitle>
        <CardDescription className="text-sm">
          최근 검색량 상위 키워드
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">순위</TableHead>
              <TableHead>키워드</TableHead>
              <TableHead className="text-right">검색량</TableHead>
              <TableHead className="text-right">CTR</TableHead>
              <TableHead className="w-12 text-center">추세</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <KeywordTableSkeleton />
            ) : keywords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  데이터 없음
                </TableCell>
              </TableRow>
            ) : (
              keywords.slice(0, 10).map((keyword, index) => (
                <TableRow key={keyword.keyword}>
                  <TableCell className="text-center text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{keyword.keyword}</TableCell>
                  <TableCell className="text-right">
                    {keyword.searches.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">{keyword.ctr}</TableCell>
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