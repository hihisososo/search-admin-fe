'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from 'lucide-react'
import type { 
  CategoryRankingDictionaryListItem 
} from '@/services/dictionary/category-ranking.service'
import { Environment as DictionaryEnvironmentType } from '@/services/common/types'

interface CategoryRankingTableProps {
  items: CategoryRankingDictionaryListItem[]
  loading: boolean
  selectedItems: number[]
  onSelectionChange: (ids: number[]) => void
  onEdit: (item: CategoryRankingDictionaryListItem) => void
  onDelete: (id: number) => void
  environment: DictionaryEnvironmentType
}

export function CategoryRankingTable({
  items,
  loading,
  selectedItems,
  onSelectionChange,
  onEdit,
  onDelete
}: CategoryRankingTableProps) {
  const canEdit = true // 카테고리랭킹은 실시간 반영이 있으므로 모든 환경에서 편집 가능

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(items.map(item => item.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedItems, id])
    } else {
      onSelectionChange(selectedItems.filter(item => item !== id))
    }
  }
  
  if (loading) {
    return <div className="text-center py-4">로딩 중...</div>
  }

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            {canEdit && (
              <TableHead className="w-12 py-2">
                <Checkbox
                  checked={items.length > 0 && selectedItems.length === items.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            <TableHead className="py-2 text-xs font-semibold text-gray-700">키워드</TableHead>
            <TableHead className="py-2 text-xs font-semibold text-gray-700 text-center w-24">카테고리 수</TableHead>
            <TableHead className="py-2 text-xs font-semibold text-gray-700 w-32">수정일</TableHead>
            {canEdit && (
              <TableHead className="py-2 text-xs font-semibold text-gray-700 text-center w-20">액션</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={canEdit ? 5 : 4} 
                className="text-center py-8 text-gray-500"
              >
                데이터가 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50">
                {canEdit && (
                  <TableCell className="py-2">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                    />
                  </TableCell>
                )}
                <TableCell className="py-2">
                  <span className="text-xs">{item.keyword}</span>
                </TableCell>
                <TableCell className="py-2 text-center">
                  <Badge 
                    variant={item.categoryCount > 0 ? "default" : "secondary"}
                    className="text-xs py-0.5 px-2"
                  >
                    {item.categoryCount || 0}개
                  </Badge>
                </TableCell>
                <TableCell className="py-2">
                  <span className="text-xs text-gray-500">
                    {new Date(item.updatedAt).toLocaleDateString('ko-KR', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </TableCell>
                {canEdit && (
                  <TableCell className="py-2">
                    <div className="flex justify-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(item)}
                        className="h-6 px-2 border-gray-300 hover:bg-gray-100"
                        title="카테고리 매핑 편집"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm(`"${item.keyword}" 항목을 삭제하시겠습니까?`)) {
                            onDelete(item.id)
                          }
                        }}
                        className="h-6 px-2 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}