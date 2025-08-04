'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash2, Check, X } from "lucide-react"
import { DictionaryFieldRenderer } from './DictionaryFieldRenderer'
import type { 
  DictionaryType,
  BaseDictionaryItem, 
  DictionaryConfig,
  DictionaryActions,
  DictionarySortField,
  DictionarySortDirection
} from '../types/dictionary.types'

interface DictionaryTableProps<T extends BaseDictionaryItem> {
  type: DictionaryType
  config: DictionaryConfig<T>
  items: T[]
  loading: boolean
  error: string | null
  canEdit: boolean
  sortField: DictionarySortField
  sortDirection: DictionarySortDirection
  onSort: (field: DictionarySortField) => void
  actions: DictionaryActions<T>
  editingState: {
    addingItem: boolean
    newItem: Partial<T>
    editingItem: Partial<T>
    highlightedId: number | null
  }
  setEditingState: React.Dispatch<React.SetStateAction<{
    addingItem: boolean
    newItem: Partial<T>
    editingItem: Partial<T>
    highlightedId: number | null
  }>>
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getSortIcon = (field: DictionarySortField, sortField: DictionarySortField, sortDirection: DictionarySortDirection) => {
  if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5" />
  return sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
}

const getThemeClasses = (color: string) => {
  const themes = {
    purple: {
      badge: 'text-purple-600 bg-purple-50',
      addRow: 'bg-blue-50 hover:bg-blue-50',
      button: 'bg-green-600 hover:bg-green-700'
    },
    orange: {
      badge: 'text-orange-600 bg-orange-50',
      addRow: 'bg-blue-50 hover:bg-blue-50',
      button: 'bg-green-600 hover:bg-green-700'
    },
    blue: {
      badge: 'text-blue-600 bg-blue-50',
      addRow: 'bg-blue-50 hover:bg-blue-50',
      button: 'bg-green-600 hover:bg-green-700'
    },
    green: {
      badge: 'text-green-600 bg-green-50',
      addRow: 'bg-blue-50 hover:bg-blue-50',
      button: 'bg-green-600 hover:bg-green-700'
    }
  }
  return themes[color as keyof typeof themes] || themes.purple
}

export function DictionaryTable<T extends BaseDictionaryItem>({
  type,
  config,
  items,
  loading,
  error,
  canEdit,
  sortField,
  sortDirection,
  onSort,
  actions,
  editingState,
  setEditingState
}: DictionaryTableProps<T>) {
  const theme = getThemeClasses(config.theme.color)
  
  if (loading) {
    return <div className="text-center py-4">로딩 중...</div>
  }
  
  if (error) {
    return <div className="text-center py-4 text-red-600">{error}</div>
  }
  
  const getFieldHeaders = () => {
    const headers = []
    
    // Always show keyword field
    headers.push(
      <TableHead
        key="keyword"
        className="cursor-pointer hover:bg-gray-100 py-2 text-xs font-semibold text-gray-700"
        onClick={() => onSort('keyword')}
      >
        <div className="flex items-center gap-1">
          {config.name.replace(' 사전', '')}
          {getSortIcon('keyword', sortField, sortDirection)}
        </div>
      </TableHead>
    )
    
    // Add other fields based on config
    if (config.fields.includes('synonyms' as keyof T)) {
      headers.push(
        <TableHead key="synonyms" className="py-2 text-xs font-semibold text-gray-700">
          동의어
        </TableHead>
      )
    }
    
    if (config.fields.includes('correctedWord' as keyof T)) {
      headers.push(
        <TableHead key="correctedWord" className="py-2 text-xs font-semibold text-gray-700">
          교정어
        </TableHead>
      )
    }
    
    return headers
  }
  
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            {getFieldHeaders()}
            <TableHead
              className="cursor-pointer hover:bg-gray-100 py-2 text-xs font-semibold text-gray-700 w-24"
              onClick={() => onSort('updatedAt')}
            >
              <div className="flex items-center gap-1">
                수정일
                {getSortIcon('updatedAt', sortField, sortDirection)}
              </div>
            </TableHead>
            {canEdit && <TableHead className="py-2 text-xs font-semibold text-gray-700 w-20">액션</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {editingState.addingItem && canEdit && (
            <TableRow className={theme.addRow}>
              <DictionaryFieldRenderer
                type={type}
                config={config}
                item={editingState.newItem as T}
                isEditing={true}
                editingValues={editingState.newItem}
                onEditingChange={(field, value) => {
                  setEditingState(prev => ({
                    ...prev,
                    newItem: { ...prev.newItem, [field]: value }
                  }))
                }}
                isNewItem={true}
              />
              <TableCell className="py-2 text-xs text-gray-500">
                -
              </TableCell>
              <TableCell className="py-2">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={actions.handleSaveNew}
                    className={`h-6 w-6 p-0 ${theme.button}`}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={actions.handleCancelNew}
                    className="h-6 w-6 p-0 border-gray-300"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
          {items.map((item) => {
            const isEditing = item.id === (editingState.editingItem as any)?.id
            
            return (
              <TableRow
                key={item.id}
                className={`hover:bg-gray-50 ${editingState.highlightedId === item.id ? "bg-amber-50" : ""}`}
              >
                <DictionaryFieldRenderer
                  type={type}
                  config={config}
                  item={item}
                  isEditing={isEditing}
                  editingValues={isEditing ? editingState.editingItem : item}
                  onEditingChange={(field, value) => {
                    setEditingState(prev => ({
                      ...prev,
                      editingItem: { ...prev.editingItem, [field]: value }
                    }))
                  }}
                  isNewItem={false}
                />
                <TableCell className="py-2 text-xs text-gray-500">
                  {formatDate(item.updatedAt)}
                </TableCell>
                {canEdit && (
                  <TableCell className="py-2">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => actions.handleSaveEdit(item)}
                          className={`h-6 w-6 p-0 ${theme.button}`}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => actions.handleCancelEdit(item)}
                          className="h-6 w-6 p-0 border-gray-300"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => actions.handleEdit(item)}
                          className="h-6 w-6 p-0 border-gray-300 hover:bg-gray-100"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => actions.handleDelete(item.id)}
                          className="h-6 w-6 p-0 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}