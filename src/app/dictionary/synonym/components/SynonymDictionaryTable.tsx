import { DictionaryBaseTable } from '@/shared/components/tables/DictionaryBaseTable'
import type { DictionaryItem, DictionarySortField, DictionarySortDirection } from "@/types/dashboard"

interface SynonymDictionaryTableProps {
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

const formatKeywordDisplay = (keyword: string) => {
  if (keyword.includes('=>')) {
    const [base, synonyms] = keyword.split('=>').map(s => s.trim())
    const synonymList = synonyms.split(',').map(s => s.trim())
    return (
      <span className="flex items-start gap-2 flex-wrap">
        <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">
          {base}
        </span>
        <span className="text-gray-400 text-xs mt-0.5">→</span>
        <div className="flex flex-wrap gap-1">
          {synonymList.map((synonym, index) => (
            <span key={index} className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs">
              {synonym}
            </span>
          ))}
        </div>
      </span>
    )
  }
  return <span className="font-medium text-gray-900">{keyword}</span>
}

export function SynonymDictionaryTable({
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
}: SynonymDictionaryTableProps) {
  
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
        return formatKeywordDisplay(item.keyword)
      }}
      emptyMessage="동의어 사전에 등록된 규칙이 없습니다."
      keywordPlaceholder="동의어 규칙을 입력하세요 (예: 휴대폰 => 핸드폰,모바일,스마트폰)"
    />
  )
}