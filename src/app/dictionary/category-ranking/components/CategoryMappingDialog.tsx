'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react'
import { categoryRankingService } from '@/services/dictionary/category-ranking.service'
import type { DictionaryEnvironmentType } from '@/types/dashboard'
import type {
  CategoryRankingDictionaryListItem,
  CategoryMapping
} from '@/services/dictionary/category-ranking.service'

const WEIGHT_CONFIG = { DEFAULT: 1000, MIN: 1, MAX: 10000 } as const

interface CategoryMappingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: CategoryRankingDictionaryListItem | null
  environment: DictionaryEnvironmentType
  onSaved: () => void
}

export function CategoryMappingDialog({
  open,
  onOpenChange,
  item,
  environment,
  onSaved
}: CategoryMappingDialogProps) {
  const [keyword, setKeyword] = useState('')
  const [mappings, setMappings] = useState<CategoryMapping[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [newWeight, setNewWeight] = useState<number>(WEIGHT_CONFIG.DEFAULT)
  const [showCategoryList, setShowCategoryList] = useState(false)
  const { toast } = useToast()

  const { data: categoriesData } = useQuery({
    queryKey: ['categories', environment],
    queryFn: () => categoryRankingService.getCategories(environment),
    enabled: open
  })

  useEffect(() => {
    if (item && open) {
      setKeyword(item.keyword)
      categoryRankingService.getById(item.id, environment)
        .then(data => setMappings(data.categoryMappings || []))
        .catch(() => setMappings([]))
    } else if (!item && open) {
      setKeyword('')
      setMappings([])
    }
  }, [item, open, environment])

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!keyword.trim()) throw new Error('키워드를 입력해주세요.')
      if (!mappings.length) throw new Error('최소 1개 이상의 카테고리 매핑이 필요합니다.')

      const data = { keyword: keyword.trim(), categoryMappings: mappings }
      return item
        ? categoryRankingService.update(item.id, data, environment)
        : categoryRankingService.create(data, environment)
    },
    onSuccess: () => {
      toast({
        title: '저장 완료',
        description: item ? '카테고리 매핑이 수정되었습니다.' : '새 키워드가 추가되었습니다.'
      })
      onSaved()
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast({
        title: '저장 실패',
        description: error.message || '저장 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
    }
  })

  const addMapping = () => {
    if (!newCategory.trim()) {
      toast({ title: '카테고리 입력', description: '카테고리명을 입력해주세요.', variant: 'destructive' })
      return
    }

    if (mappings.some(m => m.category === newCategory.trim())) {
      toast({ title: '중복 카테고리', description: '이미 추가된 카테고리입니다.', variant: 'destructive' })
      return
    }

    setMappings([...mappings, { category: newCategory.trim(), weight: newWeight }])
    setNewCategory('')
    setNewWeight(WEIGHT_CONFIG.DEFAULT)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? '카테고리 매핑 편집' : '새 키워드 추가'}</DialogTitle>
          <DialogDescription>키워드와 관련된 카테고리를 매핑하고 가중치를 설정합니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="keyword">키워드 *</Label>
            <Input
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="예: 아이폰"
              disabled={!!item}
            />
          </div>

          <div className="space-y-2">
            <Label>카테고리 매핑 *</Label>

            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="카테고리명 입력..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full pr-8"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-2"
                    onClick={() => setShowCategoryList(!showCategoryList)}
                  >
                    {showCategoryList ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                <Input
                  type="number"
                  placeholder="가중치"
                  value={newWeight}
                  onChange={(e) => setNewWeight(Number(e.target.value))}
                  className="w-24"
                  min={WEIGHT_CONFIG.MIN}
                  max={WEIGHT_CONFIG.MAX}
                />

                <Button type="button" size="sm" onClick={addMapping}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {showCategoryList && categoriesData?.categories && categoriesData.categories.length > 0 && (
                <div className="border rounded-md max-h-48 overflow-y-auto p-1">
                  {categoriesData.categories.map(cat => (
                    <div
                      key={cat}
                      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer rounded"
                      onClick={() => {
                        setNewCategory(cat)
                        setShowCategoryList(false)
                      }}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 mt-3">
              {mappings.length === 0 ? (
                <div className="text-sm text-gray-500 py-4 text-center border rounded-md">
                  카테고리 매핑이 없습니다. 최소 1개 이상 추가해주세요.
                </div>
              ) : (
                mappings.map(mapping => (
                  <div key={mapping.category} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="flex-1 text-sm">{mapping.category}</span>
                    <Input
                      type="number"
                      value={mapping.weight}
                      onChange={(e) => setMappings(mappings.map(m =>
                        m.category === mapping.category ? { ...m, weight: Number(e.target.value) } : m
                      ))}
                      className="w-20 h-7 text-xs"
                      min={WEIGHT_CONFIG.MIN}
                      max={WEIGHT_CONFIG.MAX}
                    />
                    <Badge variant="outline" className="text-xs">
                      가중치: {mapping.weight}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setMappings(mappings.filter(m => m.category !== mapping.category))}
                      className="h-7 w-7 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            <p className="text-xs text-gray-500">
              가중치는 {WEIGHT_CONFIG.MIN}~{WEIGHT_CONFIG.MAX} 사이의 값을 설정할 수 있습니다.
              (기본값: {WEIGHT_CONFIG.DEFAULT}, 높을수록 우선순위 높음)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}