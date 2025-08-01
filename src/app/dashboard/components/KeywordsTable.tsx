import { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { TopKeyword } from '../hooks/use-dashboard-transformers'

interface KeywordsTableProps {
  keywords: TopKeyword[]
  loading: boolean
}

const RANK_STYLES = [
  'bg-yellow-100 text-yellow-800',
  'bg-gray-100 text-gray-800',
  'bg-orange-100 text-orange-800',
  'bg-blue-100 text-blue-800',
] as const

const TrendIcon = memo(({ trend }: { trend: TopKeyword['trend'] }) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-500" />
    case 'down':
      return <TrendingDown className="h-4 w-4 text-red-500" />
    case 'stable':
      return <Minus className="h-4 w-4 text-gray-500" />
  }
})

TrendIcon.displayName = 'TrendIcon'

const KeywordTableSkeleton = memo(() => (
  <>
    {Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <Skeleton className="h-4 w-6" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-16" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-12" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-8 mx-auto" />
        </TableCell>
      </TableRow>
    ))}
  </>
))

KeywordTableSkeleton.displayName = 'KeywordTableSkeleton'

const KeywordRow = memo(({ keyword, index }: { keyword: TopKeyword; index: number }) => {
  const rankStyle = RANK_STYLES[Math.min(index, RANK_STYLES.length - 1)]

  return (
    <TableRow className="hover:bg-gray-50/50">
      <TableCell className="font-medium text-center">
        <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm ${rankStyle}`}>
          {index + 1}
        </div>
      </TableCell>
      <TableCell className="font-medium">{keyword.keyword}</TableCell>
      <TableCell className="text-right font-mono">
        {keyword.searches.toLocaleString()}
      </TableCell>
      <TableCell className="text-right font-mono">{keyword.ctr}</TableCell>
      <TableCell className="text-center">
        <TrendIcon trend={keyword.trend} />
      </TableCell>
    </TableRow>
  )
})

KeywordRow.displayName = 'KeywordRow'

export default memo(function KeywordsTable({ keywords, loading }: KeywordsTableProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-xl font-semibold text-gray-900">
            인기 검색 키워드
          </CardTitle>
        </div>
        <CardDescription className="text-gray-600">
          최근 검색량이 많은 키워드 순위
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">순위</TableHead>
                <TableHead>키워드</TableHead>
                <TableHead className="text-right">검색량</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-center">추세</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <KeywordTableSkeleton />
              ) : (
                keywords.map((keyword, index) => (
                  <KeywordRow key={keyword.keyword} keyword={keyword} index={index} />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
})