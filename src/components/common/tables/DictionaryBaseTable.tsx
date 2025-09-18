import React from 'react'
import { BaseTable, type Column } from './BaseTable'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Check, X } from "lucide-react"
import { formatDate } from "@/utils/date-helpers"
import type { DictionaryItem, DictionarySortField, DictionarySortDirection } from '@/services/dictionary/types'

interface DictionaryBaseTableProps<T extends DictionaryItem> {
  items: T[]
  sortField: DictionarySortField
  sortDirection: DictionarySortDirection
  onSort: (field: DictionarySortField) => void
  canEdit: boolean
  highlightedId: number | null
  
  // 편집 관련
  addingItem?: boolean
  editingItem?: Partial<T>
  newItem?: Partial<T>
  onEdit?: (item: T) => void
  onSaveEdit?: (item: T) => void
  onCancelEdit?: (item: T) => void
  onDelete?: (id: number) => void
  onSaveNew?: () => void
  onCancelNew?: () => void
  onFieldChange?: (field: keyof T, value: any, isNew: boolean) => void
  
  // 커스텀 렌더링
  renderKeyword?: (item: T, isEditing: boolean, isNew: boolean) => React.ReactNode
  renderAdditionalFields?: (item: T, isEditing: boolean, isNew: boolean) => React.ReactNode
  validateKeyword?: (keyword: string) => boolean
  
  // 메시지
  emptyMessage?: string
  keywordPlaceholder?: string
}

export function DictionaryBaseTable<T extends DictionaryItem>({
  items,
  sortField,
  sortDirection,
  onSort,
  canEdit,
  highlightedId,
  addingItem = false,
  editingItem = {},
  newItem = {},
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onSaveNew,
  onCancelNew,
  onFieldChange,
  renderKeyword,
  renderAdditionalFields,
  validateKeyword,
  emptyMessage = '데이터가 없습니다.',
  keywordPlaceholder = '키워드를 입력하세요'
}: DictionaryBaseTableProps<T>) {
  
  const columns: Column<T | 'new'>[] = [
    {
      key: 'id',
      label: 'ID',
      width: 'w-16',
      align: 'center',
      sortable: true,
      render: (item) => {
        if (item === 'new') return '-'
        return <span className="text-muted-foreground text-xs">{(item as T).id}</span>
      }
    },
    {
      key: 'keyword',
      label: '키워드',
      sortable: true,
      render: (item) => {
        const isNew = item === 'new'
        const actualItem = isNew ? newItem as T : item as T
        const isEditing = !isNew && editingItem.id === actualItem.id
        
        if (renderKeyword) {
          return renderKeyword(actualItem, isEditing, isNew)
        }
        
        if (isNew || isEditing) {
          const currentValue = isNew ? newItem.keyword : editingItem.keyword
          return (
            <Input
              value={currentValue || ''}
              onChange={(e) => onFieldChange?.('keyword' as keyof T, e.target.value, isNew)}
              placeholder={keywordPlaceholder}
              className={`h-8 ${validateKeyword && currentValue && !validateKeyword(currentValue) ? 'border-red-500' : ''}`}
              autoFocus
            />
          )
        }
        
        return (
          <span className="font-medium text-left">
            {actualItem.keyword}
          </span>
        )
      }
    },
    ...(renderAdditionalFields ? [{
      key: 'additional',
      label: '추가 정보',
      render: (item: T | 'new') => {
        const isNew = item === 'new'
        const actualItem = isNew ? newItem as T : item as T
        const isEditing = !isNew && editingItem.id === actualItem.id
        return renderAdditionalFields(actualItem, isEditing, isNew)
      }
    }] as Column<T | 'new'>[] : []),
    {
      key: 'createdDt',
      label: '생성일',
      width: 'w-36',
      align: 'center',
      sortable: true,
      render: (item) => {
        if (item === 'new') return '-'
        return (
          <span className="text-xs text-muted-foreground">
            {formatDate((item as T).createdAt || (item as any).createdDt)}
          </span>
        )
      }
    },
    {
      key: 'updatedDt',
      label: '수정일',
      width: 'w-36',
      align: 'center',
      sortable: true,
      render: (item) => {
        if (item === 'new') return '-'
        return (
          <span className="text-xs text-muted-foreground">
            {formatDate((item as T).updatedAt || (item as any).updatedDt)}
          </span>
        )
      }
    },
    ...(canEdit ? [{
      key: 'actions',
      label: '작업',
      width: 'w-24',
      align: 'center',
      render: (item: T | 'new') => {
        const isNew = item === 'new'
        const actualItem = isNew ? newItem as T : item as T
        const isEditing = !isNew && editingItem.id === actualItem.id
        
        if (isNew) {
          return (
            <div className="flex justify-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={onSaveNew}
                disabled={!validateKeyword || !newItem.keyword || (validateKeyword && !validateKeyword(newItem.keyword as string))}
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancelNew}
              >
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          )
        }
        
        if (isEditing) {
          return (
            <div className="flex justify-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onSaveEdit?.(actualItem)}
                disabled={!validateKeyword || !editingItem.keyword || (validateKeyword && !validateKeyword(editingItem.keyword as string))}
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCancelEdit?.(actualItem)}
              >
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          )
        }
        
        return (
          <div className="flex justify-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit?.(actualItem)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete?.(actualItem.id)}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        )
      }
    }] as Column<T | 'new'>[] : [])
  ]
  
  const displayData = addingItem ? ['new' as const, ...items] : items
  
  return (
    <BaseTable
      columns={columns}
      data={displayData}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
      emptyMessage={emptyMessage}
      keyExtractor={(item) => item === 'new' ? 'new' : (item as T).id.toString()}
      highlightedId={highlightedId}
    />
  )
}