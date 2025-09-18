import { DictionaryBaseTable } from '@/components/common/tables/DictionaryBaseTable'
import type { DictionaryItem, DictionarySortField, DictionarySortDirection } from '@/services/dictionary/types'

interface StopwordDictionaryTableProps {
  items: DictionaryItem[]
  addingItem: boolean
  newKeyword: string
  editingKeyword: string
  highlightedId: number | null
  sortField: DictionarySortField
  sortDirection: DictionarySortDirection
  onSort: (field: DictionarySortField) => void
  onEdit: (item: DictionaryItem) => void
  onSaveEdit: (item: DictionaryItem) => void
  onCancelEdit: (item: DictionaryItem) => void
  onDelete: (id: number) => void
  onNewKeywordChange: (value: string) => void
  onEditingKeywordChange: (value: string) => void
  onSaveNew: () => void
  onCancelNew: () => void
  validateKeyword: (keyword: string) => boolean
  canEdit: boolean
}

export function StopwordDictionaryTable({
  items,
  addingItem,
  newKeyword,
  editingKeyword,
  highlightedId,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onNewKeywordChange,
  onEditingKeywordChange,
  onSaveNew,
  onCancelNew,
  validateKeyword,
  canEdit
}: StopwordDictionaryTableProps) {
  
  const editingItem = items.find(item => 
    editingKeyword && item.keyword === editingKeyword
  )
  
  return (
    <DictionaryBaseTable
      items={items}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
      canEdit={canEdit}
      highlightedId={highlightedId}
      addingItem={addingItem}
      editingItem={editingItem ? { ...editingItem, keyword: editingKeyword } : undefined}
      newItem={{ keyword: newKeyword }}
      onEdit={onEdit}
      onSaveEdit={onSaveEdit}
      onCancelEdit={onCancelEdit}
      onDelete={onDelete}
      onSaveNew={onSaveNew}
      onCancelNew={onCancelNew}
      onFieldChange={(field, value, isNew) => {
        if (field === 'keyword') {
          if (isNew) {
            onNewKeywordChange(value as string)
          } else {
            onEditingKeywordChange(value as string)
          }
        }
      }}
      validateKeyword={validateKeyword}
      renderKeyword={(item, isEditing, isNew) => {
        if (isNew || isEditing) return undefined
        return (
          <span className="font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs">
            {item.keyword}
          </span>
        )
      }}
      emptyMessage="불용어 사전에 등록된 키워드가 없습니다."
      keywordPlaceholder="불용어를 입력하세요 (예: 는)"
    />
  )
}
