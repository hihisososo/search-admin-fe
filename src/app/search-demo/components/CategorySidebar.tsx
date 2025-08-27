import * as React from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  count?: number
  children?: Category[]
}

interface CategorySidebarProps {
  selectedCategory: string | null
  onCategorySelect: (categoryId: string | null) => void
}

// 임시 카테고리 데이터 (백엔드 API 준비 전)
const mockCategories: Category[] = [
  {
    id: 'electronics',
    name: '전자제품',
    count: 2453,
    children: [
      { id: 'laptop', name: '노트북', count: 523 },
      { id: 'desktop', name: '데스크탑', count: 312 },
      { id: 'monitor', name: '모니터', count: 428 },
      { id: 'keyboard', name: '키보드', count: 256 },
      { id: 'mouse', name: '마우스', count: 189 },
      { id: 'speaker', name: '스피커', count: 165 },
      { id: 'headphone', name: '헤드폰', count: 234 },
      { id: 'tablet', name: '태블릿', count: 346 }
    ]
  },
  {
    id: 'clothing',
    name: '의류',
    count: 3821,
    children: [
      { id: 'mens-clothing', name: '남성의류', count: 1523 },
      { id: 'womens-clothing', name: '여성의류', count: 1892 },
      { id: 'kids-clothing', name: '아동의류', count: 406 }
    ]
  },
  {
    id: 'food',
    name: '식품',
    count: 5123,
    children: [
      { id: 'fresh-food', name: '신선식품', count: 1234 },
      { id: 'processed-food', name: '가공식품', count: 2134 },
      { id: 'beverage', name: '음료', count: 892 },
      { id: 'snack', name: '과자/간식', count: 863 }
    ]
  },
  {
    id: 'beauty',
    name: '뷰티',
    count: 2931,
    children: [
      { id: 'skincare', name: '스킨케어', count: 1243 },
      { id: 'makeup', name: '메이크업', count: 892 },
      { id: 'haircare', name: '헤어케어', count: 456 },
      { id: 'bodycare', name: '바디케어', count: 340 }
    ]
  },
  {
    id: 'sports',
    name: '스포츠/레저',
    count: 1842,
    children: [
      { id: 'fitness', name: '피트니스', count: 632 },
      { id: 'outdoor', name: '아웃도어', count: 523 },
      { id: 'golf', name: '골프', count: 387 },
      { id: 'cycling', name: '자전거', count: 300 }
    ]
  },
  {
    id: 'home',
    name: '홈/리빙',
    count: 4231,
    children: [
      { id: 'furniture', name: '가구', count: 1523 },
      { id: 'kitchen', name: '주방용품', count: 1234 },
      { id: 'bedding', name: '침구류', count: 742 },
      { id: 'decor', name: '홈데코', count: 732 }
    ]
  },
  {
    id: 'books',
    name: '도서',
    count: 6234,
    children: [
      { id: 'novel', name: '소설', count: 2134 },
      { id: 'self-help', name: '자기계발', count: 1523 },
      { id: 'comics', name: '만화', count: 1432 },
      { id: 'magazine', name: '잡지', count: 1145 }
    ]
  },
  {
    id: 'toys',
    name: '완구/취미',
    count: 1523,
    children: [
      { id: 'lego', name: '레고/블록', count: 423 },
      { id: 'figure', name: '피규어', count: 312 },
      { id: 'board-game', name: '보드게임', count: 288 },
      { id: 'puzzle', name: '퍼즐', count: 500 }
    ]
  }
]

export function CategorySidebar({ selectedCategory, onCategorySelect }: CategorySidebarProps) {
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(
    new Set(mockCategories.map(c => c.id))
  )

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const handleCategoryClick = (categoryId: string | null, hasChildren: boolean) => {
    if (!hasChildren) {
      onCategorySelect(categoryId)
    }
  }

  return (
    <div className="w-[250px] h-full bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">카테고리</h2>
      </div>
      
      <div className="h-[calc(100vh-200px)] overflow-y-auto">
        <div className="p-2">
          {/* 전체 카테고리 옵션 */}
          <div
            className={cn(
              "px-3 py-2 rounded-md cursor-pointer transition-colors text-sm",
              selectedCategory === null
                ? "bg-blue-50 text-blue-700 font-medium"
                : "hover:bg-gray-100 text-gray-700"
            )}
            onClick={() => onCategorySelect(null)}
          >
            전체 카테고리
          </div>

          {/* 카테고리 목록 */}
          {mockCategories.map(category => (
            <div key={category.id} className="mt-1">
              {/* 대분류 */}
              <div
                className={cn(
                  "px-3 py-2 rounded-md cursor-pointer transition-colors flex items-center justify-between text-sm",
                  selectedCategory === category.id
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                )}
                onClick={() => {
                  if (category.children && category.children.length > 0) {
                    toggleCategory(category.id)
                  } else {
                    handleCategoryClick(category.id, false)
                  }
                }}
              >
                <div className="flex items-center gap-1">
                  {category.children && category.children.length > 0 && (
                    <span className="w-4 h-4">
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </span>
                  )}
                  {(!category.children || category.children.length === 0) && (
                    <span className="w-4 h-4" />
                  )}
                  <span>{category.name}</span>
                </div>
                {category.count !== undefined && (
                  <span className="text-xs text-gray-500">({category.count})</span>
                )}
              </div>

              {/* 중분류 */}
              {category.children && expandedCategories.has(category.id) && (
                <div className="ml-6 mt-1 space-y-1">
                  {category.children.map(subCategory => (
                    <div
                      key={subCategory.id}
                      className={cn(
                        "px-3 py-1.5 rounded-md cursor-pointer transition-colors text-sm",
                        selectedCategory === subCategory.id
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "hover:bg-gray-100 text-gray-600"
                      )}
                      onClick={() => handleCategoryClick(subCategory.id, false)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{subCategory.name}</span>
                        {subCategory.count !== undefined && (
                          <span className="text-xs text-gray-400">({subCategory.count})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}