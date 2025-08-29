import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BaseTable, type Column } from '@/shared/components/tables'
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

export default memo(function KeywordsTableRefactored({ 
  keywords, 
  loading,
  title = '인기 검색 키워드 TOP 10',
  type = 'popular'
}: KeywordsTableProps) {
  
  const columns: Column<TopKeyword>[] = [
    {
      key: 'rank',
      label: '순위',
      width: 'w-12',
      align: 'center',
      render: (item) => {
        const index = keywords.indexOf(item)
        return (
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
        )
      }
    },
    {
      key: 'keyword',
      label: '키워드',
      align: 'left',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="truncate max-w-[200px] font-medium" title={item.keyword}>
            {item.keyword}
          </span>
        </div>
      )
    },
    {
      key: 'searches',
      label: '검색량',
      align: 'center',
      render: (item) => (
        <span className="font-medium">{item.searches.toLocaleString()}</span>
      )
    },
    {
      key: 'percentage',
      label: '비율',
      align: 'center',
      render: (item) => (
        <span className="text-muted-foreground">
          {item.percentage ? `${item.percentage.toFixed(1)}%` : '-'}
        </span>
      )
    },
    {
      key: 'ctr',
      label: 'CTR',
      align: 'center',
      render: (item) => (
        <span className={`font-medium ${
          parseFloat(item.ctr) > 5 ? 'text-green-600' : 
          parseFloat(item.ctr) > 2 ? 'text-yellow-600' : 
          'text-gray-500'
        }`}>
          {item.ctr}
        </span>
      )
    },
    {
      key: 'trend',
      label: '추세',
      width: 'w-16',
      align: 'center',
      render: (item) => <TrendIcon trend={item.trend} />
    }
  ]

  return (
    <Card>
      <CardHeader className="pb-2 pt-2">
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
        <BaseTable
          columns={columns}
          data={keywords.slice(0, 10)}
          loading={loading}
          emptyMessage="데이터 없음"
          keyExtractor={(item) => item.keyword}
        />
      </CardContent>
    </Card>
  )
})