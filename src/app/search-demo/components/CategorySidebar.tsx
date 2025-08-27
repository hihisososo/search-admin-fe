import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { evaluationService } from '@/services/evaluation/api'
import type { EvaluationCategory } from '@/services/evaluation/types'
import { Skeleton } from '@/components/ui/skeleton'
import './categoryScrollbar.css'


interface CategorySidebarProps {
  selectedCategory: string | null
  onCategorySelect: (categoryId: string | null) => void
}


export function CategorySidebar({ selectedCategory, onCategorySelect }: CategorySidebarProps) {
  const [categories, setCategories] = React.useState<EvaluationCategory[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await evaluationService.getCategories({ size: 100 })
        // 가나다순 정렬
        const sortedCategories = (response.categories || []).sort((a, b) => 
          a.name.localeCompare(b.name, 'ko')
        )
        setCategories(sortedCategories)
      } catch (error) {
        console.error('카테고리 조회 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleCategoryClick = (categoryName: string) => {
    // 같은 카테고리 다시 클릭하면 선택 해제
    if (selectedCategory === categoryName) {
      onCategorySelect(null)
    } else {
      onCategorySelect(categoryName)
    }
  }

  return (
    <Card className="w-full shadow-sm border border-border py-0">
      <CardContent className="p-3 pt-2">
        <div className="text-black font-semibold text-foreground mb-4">전체 카테고리</div>
        <div className="custom-scrollbar max-h-[480px] overflow-y-auto pr-1">
          {loading ? (
            <div className="grid grid-cols-2 gap-0.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-0.5">
              {categories.map(category => (
                <div
                  key={category.name}
                  className={cn(
                    "px-2 py-1 rounded cursor-pointer transition-colors text-xs",
                    selectedCategory === category.name
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "hover:bg-gray-100 text-gray-700 font-medium hover:text-gray-900 hover:font-semibold"
                  )}
                  onClick={() => handleCategoryClick(category.name)}
                >
                  {category.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}