import { DictionaryBaseTable } from '@/components/common/tables/DictionaryBaseTable'
import type { DictionaryItem, DictionarySortField, DictionarySortDirection } from "@/types/dashboard"

interface UserDictionaryTableProps {
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

export function UserDictionaryTable({
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
}: UserDictionaryTableProps) {
  
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
      editingItem={editingItem ? { ...editingItem, keyword: editingKeyword } : {}}
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
      emptyMessage="?¬ìš©???¬ì „???±ë¡???¤ì›Œ?œê? ?†ìŠµ?ˆë‹¤."
      keywordPlaceholder="?¬ìš©???•ì˜ ?¤ì›Œ???…ë ¥"
    />
  )
}
