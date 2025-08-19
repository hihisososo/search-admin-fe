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
import { Plus, Trash2, X } from 'lucide-react'
import { categoryRankingService } from '@/services/dictionary/category-ranking.service'
import type { DictionaryEnvironmentType } from '@/types/dashboard'
import type { 
  CategoryRankingDictionaryListItem,
  CategoryMapping 
} from '@/services/dictionary/category-ranking.service'

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
  const [description, setDescription] = useState('')
  const [mappings, setMappings] = useState<CategoryMapping[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [newWeight, setNewWeight] = useState(1000)
  const { toast } = useToast()

  // 카테고리 목록 조회
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', environment],
    queryFn: () => categoryRankingService.getCategories(environment),
    enabled: open
  })

  // 기존 데이터 로드
  useEffect(() => {
    if (item && open) {
      setKeyword(item.keyword)
      setDescription(item.description || '')
      // 상세 정보 조회
      categoryRankingService.getById(item.id, environment).then(data => {
        setMappings(data.categoryMappings || [])
      }).catch(error => {
        console.error('Failed to load detail:', error)
        setMappings([])
      })
    } else if (!item && open) {
      // 새 항목
      setKeyword('')
      setDescription('')
      setMappings([])
    }
  }, [item, open, environment])

  // 저장 mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!keyword.trim()) {
        throw new Error('키워드를 입력해주세요.')
      }
      
      if (mappings.length === 0) {
        throw new Error('최소 1개 이상의 카테고리 매핑이 필요합니다.')
      }

      const data = {
        keyword: keyword.trim(),
        description: description.trim() || undefined,
        categoryMappings: mappings
      }

      if (item) {
        // 수정
        return categoryRankingService.update(item.id, data, environment)
      } else {
        // 신규
        return categoryRankingService.create(data, environment)
      }
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

  // 카테고리 매핑 추가
  const addMapping = () => {
    if (!newCategory.trim()) {
      toast({
        title: '카테고리 입력',
        description: '카테고리명을 입력해주세요.',
        variant: 'destructive'
      })
      return
    }

    // 중복 체크
    if (mappings.some(m => m.category === newCategory.trim())) {
      toast({
        title: '중복 카테고리',
        description: '이미 추가된 카테고리입니다.',
        variant: 'destructive'
      })
      return
    }

    setMappings([...mappings, {
      category: newCategory.trim(),
      weight: newWeight
    }])

    // 초기화
    setNewCategory('')
    setNewWeight(1000)
  }

  // 카테고리 매핑 삭제
  const removeMapping = (category: string) => {
    setMappings(mappings.filter(m => m.category !== category))
  }

  // 가중치 수정
  const updateWeight = (category: string, weight: number) => {
    setMappings(mappings.map(m => 
      m.category === category ? { ...m, weight } : m
    ))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? '카테고리 매핑 편집' : '새 키워드 추가'}
          </DialogTitle>
          <DialogDescription>
            키워드와 관련된 카테고리를 매핑하고 가중치를 설정합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 키워드 입력 */}
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

          {/* 설명 입력 */}
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="키워드에 대한 설명 (선택사항)"
            />
          </div>

          {/* 카테고리 매핑 섹션 */}
          <div className="space-y-2">
            <Label>카테고리 매핑 *</Label>
            
            {/* 카테고리 추가 폼 */}
            <div className="flex gap-2">
              <Input
                placeholder="카테고리명 입력..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1"
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
                {categoriesData?.categories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              
              <Input
                type="number"
                placeholder="가중치"
                value={newWeight}
                onChange={(e) => setNewWeight(Number(e.target.value))}
                className="w-24"
                min={1}
                max={10000}
              />
              
              <Button
                type="button"
                size="sm"
                onClick={addMapping}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* 매핑된 카테고리 목록 */}
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
                      onChange={(e) => updateWeight(mapping.category, Number(e.target.value))}
                      className="w-20 h-7 text-xs"
                      min={1}
                      max={10000}
                    />
                    <Badge variant="outline" className="text-xs">
                      가중치: {mapping.weight}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMapping(mapping.category)}
                      className="h-7 w-7 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
            
            <p className="text-xs text-gray-500">
              가중치는 1~10000 사이의 값을 설정할 수 있습니다. (기본값: 1000, 높을수록 우선순위 높음)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
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