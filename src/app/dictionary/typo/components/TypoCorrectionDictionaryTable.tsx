import React from 'react'
import { DictionaryBaseTable } from '@/shared/components/tables/DictionaryBaseTable'
import { Input } from "@/components/ui/input"
import type { DictionarySortField, DictionarySortDirection } from "@/types/dashboard"
import type { TypoCorrectionDictionaryItem } from "@/services/dictionary/types"

interface TypoCorrectionDictionaryTableProps {
  items: TypoCorrectionDictionaryItem[]
  addingItem: boolean
  newKeyword: string
  newCorrectedWord: string
  editingKeyword: string
  editingCorrectedWord: string
  highlightedId: number | null
  sortField: DictionarySortField
  sortDirection: DictionarySortDirection
  onSort: (field: DictionarySortField) => void
  onEdit: (item: TypoCorrectionDictionaryItem) => void
  onSaveEdit: (item: TypoCorrectionDictionaryItem) => void
  onCancelEdit: (item: TypoCorrectionDictionaryItem) => void
  onDelete: (id: number) => void
  onNewKeywordChange: (value: string) => void
  onNewCorrectedWordChange: (value: string) => void
  onEditingKeywordChange: (value: string) => void
  onEditingCorrectedWordChange: (value: string) => void
  onSaveNew: () => void
  onCancelNew: () => void
  validateTypoCorrection: (keyword: string, correctedWord: string) => boolean
  canEdit: boolean
}

export function TypoCorrectionDictionaryTable({
  items,
  addingItem,
  newKeyword,
  newCorrectedWord,
  editingKeyword,
  editingCorrectedWord,
  highlightedId,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onNewKeywordChange,
  onNewCorrectedWordChange,
  onEditingKeywordChange,
  onEditingCorrectedWordChange,
  onSaveNew,
  onCancelNew,
  validateTypoCorrection,
  canEdit
}: TypoCorrectionDictionaryTableProps) {
  
  const editingItem = items.find(item => 
    editingKeyword && (item.typoWord === editingKeyword || item.keyword === editingKeyword)
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
      editingItem={editingItem ? { 
        ...editingItem, 
        keyword: editingKeyword,
        correctedWord: editingCorrectedWord 
      } : undefined}
      newItem={{ 
        keyword: newKeyword,
        correctedWord: newCorrectedWord 
      }}
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
        } else if (field === 'correctedWord') {
          if (isNew) {
            onNewCorrectedWordChange(value as string)
          } else {
            onEditingCorrectedWordChange(value as string)
          }
        }
      }}
      validateKeyword={() => validateTypoCorrection(
        addingItem ? newKeyword : editingKeyword,
        addingItem ? newCorrectedWord : editingCorrectedWord
      )}
      renderKeyword={(item, isEditing, isNew) => {
        if (isNew || isEditing) {
          const currentValue = isNew ? newKeyword : editingKeyword
          const isValid = validateTypoCorrection(
            currentValue,
            isNew ? newCorrectedWord : editingCorrectedWord
          )
          return (
            <Input
              value={currentValue || ''}
              onChange={(e) => {
                if (isNew) {
                  onNewKeywordChange(e.target.value)
                } else {
                  onEditingKeywordChange(e.target.value)
                }
              }}
              placeholder="오타 단어를 입력하세요 (예: 삼송)"
              className={`h-8 ${!isValid && currentValue ? 'border-red-500' : ''}`}
              autoFocus
            />
          )
        }
        
        const typoWord = (item as TypoCorrectionDictionaryItem).typoWord || item.keyword
        return (
          <span className="font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs">
            {typoWord}
          </span>
        )
      }}
      renderAdditionalFields={(item, isEditing, isNew) => {
        if (isNew || isEditing) {
          const currentValue = isNew ? newCorrectedWord : editingCorrectedWord
          const isValid = validateTypoCorrection(
            isNew ? newKeyword : editingKeyword,
            currentValue
          )
          return (
            <Input
              value={currentValue || ''}
              onChange={(e) => {
                if (isNew) {
                  onNewCorrectedWordChange(e.target.value)
                } else {
                  onEditingCorrectedWordChange(e.target.value)
                }
              }}
              placeholder="교정어를 입력하세요 (예: 삼성)"
              className={`h-8 ${!isValid && currentValue ? 'border-red-500' : ''}`}
            />
          )
        }
        
        const correctedWord = (item as TypoCorrectionDictionaryItem).correctWord || 
                              (item as TypoCorrectionDictionaryItem).correctedWord || '-'
        return (
          <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs">
            {correctedWord}
          </span>
        )
      }}
      emptyMessage="오타교정 사전에 등록된 항목이 없습니다."
      keywordPlaceholder="오타 단어를 입력하세요"
    />
  )
}