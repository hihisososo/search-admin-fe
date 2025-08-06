'use client'

import { TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MorphemeAnalyzer } from './MorphemeAnalyzer'
import type { 
  DictionaryType,
  BaseDictionaryItem, 
  DictionaryConfig,
  SynonymDictionaryItem,
  TypoDictionaryItem
} from '../types/dictionary.types'

interface DictionaryFieldRendererProps<T extends BaseDictionaryItem> {
  type: DictionaryType
  config: DictionaryConfig<T>
  item: T
  isEditing: boolean
  editingValues: Partial<T>
  onEditingChange: (field: keyof T, value: any) => void
  isNewItem: boolean
}


export function DictionaryFieldRenderer<T extends BaseDictionaryItem>({
  type,
  config,
  item,
  isEditing,
  editingValues,
  onEditingChange
}: DictionaryFieldRendererProps<T>) {
  
  if (type === 'synonym') {
    const synonymItem = item as unknown as SynonymDictionaryItem
    const editingSynonymItem = editingValues as unknown as Partial<SynonymDictionaryItem>
    
    if (isEditing) {
      return (
        <>
          <TableCell className="py-2">
            <Input
              placeholder={config.messages.placeholder.keyword}
              value={editingSynonymItem.keyword || ''}
              onChange={(e) => onEditingChange('keyword' as keyof T, e.target.value)}
              className="h-7 text-xs"
            />
          </TableCell>
          <TableCell className="py-2">
            <Input
              placeholder={config.messages.placeholder.synonyms}
              value={editingSynonymItem.synonyms?.join(', ') || ''}
              onChange={(e) => onEditingChange('synonyms' as keyof T, e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              className="h-7 text-xs"
            />
          </TableCell>
        </>
      )
    }
    
    return (
      <>
        <TableCell className="py-2">
          <span className="font-medium text-xs">
            {synonymItem.keyword}
          </span>
        </TableCell>
        <TableCell className="py-2">
          <div className="flex flex-wrap gap-1">
            {synonymItem.synonyms?.map((synonym, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {synonym}
              </Badge>
            ))}
          </div>
        </TableCell>
      </>
    )
  }
  
  if (type === 'typo') {
    const typoItem = item as unknown as TypoDictionaryItem
    const editingTypoItem = editingValues as unknown as Partial<TypoDictionaryItem>
    
    if (isEditing) {
      return (
        <>
          <TableCell className="py-2">
            <Input
              placeholder={config.messages.placeholder.keyword}
              value={editingTypoItem.keyword || ''}
              onChange={(e) => onEditingChange('keyword' as keyof T, e.target.value)}
              className="h-7 text-xs"
            />
          </TableCell>
          <TableCell className="py-2">
            <Input
              placeholder={config.messages.placeholder.correctedWord}
              value={editingTypoItem.correctedWord || ''}
              onChange={(e) => onEditingChange('correctedWord' as keyof T, e.target.value)}
              className="h-7 text-xs"
            />
          </TableCell>
        </>
      )
    }
    
    return (
      <>
        <TableCell className="py-2">
          <span className="font-medium text-xs">
            {typoItem.keyword}
          </span>
        </TableCell>
        <TableCell className="py-2">
          <span className="text-xs font-medium">
            → {typoItem.correctedWord}
          </span>
        </TableCell>
      </>
    )
  }
  
  // Default renderer for user and stopword dictionaries
  if (isEditing) {
    return (
      <TableCell className="py-2">
        <div className="space-y-2">
          <Input
            placeholder={config.messages.placeholder.keyword}
            value={editingValues.keyword || ''}
            onChange={(e) => onEditingChange('keyword' as keyof T, e.target.value)}
            className="h-7 text-xs"
          />
          {!config.validation.keyword?.(editingValues.keyword || '') && editingValues.keyword !== undefined && (
            <div className="text-red-600 text-xs">{config.messages.validationError.keyword}</div>
          )}
          {type === 'user' && editingValues.keyword && (
            <MorphemeAnalyzer 
              text={editingValues.keyword} 
              environment="DEV"
              className="mt-2"
            />
          )}
        </div>
      </TableCell>
    )
  }
  
  return (
    <TableCell className="py-2">
      <div className="break-words">
        <span className={`font-medium ${badgeClass} px-2 py-0.5 rounded text-xs`}>
          {item.keyword}
        </span>
      </div>
    </TableCell>
  )
}