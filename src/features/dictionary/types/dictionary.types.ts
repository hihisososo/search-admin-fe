import type { DictionaryEnvironmentType } from '@/types/dashboard'

export type DictionarySortField = 'keyword' | 'updatedAt' | 'createdAt'
export type DictionarySortDirection = 'asc' | 'desc'

export type DictionaryType = 'user' | 'stopword' | 'synonym' | 'typo'

export interface BaseDictionaryItem {
  id: number
  keyword: string
  createdAt: string
  updatedAt: string
  isEditing?: boolean
}

export interface UserDictionaryItem extends BaseDictionaryItem {}

export interface StopwordDictionaryItem extends BaseDictionaryItem {}

export interface SynonymDictionaryItem extends BaseDictionaryItem {
  synonyms: string[]
}

export interface TypoDictionaryItem extends BaseDictionaryItem {
  correctedWord: string
}

export type DictionaryItem = 
  | UserDictionaryItem 
  | StopwordDictionaryItem 
  | SynonymDictionaryItem 
  | TypoDictionaryItem

export interface DictionaryConfig<T extends BaseDictionaryItem = BaseDictionaryItem> {
  name: string
  apiPath: string
  theme: {
    color: 'purple' | 'orange' | 'blue' | 'green'
    iconName: string
  }
  fields: Array<keyof T>
  validation: {
    [K in keyof T]?: (value: T[K]) => boolean
  }
  features: {
    realtimeSync: boolean
    customRenderer?: string
  }
  messages: {
    placeholder: Record<string, string>
    validationError: Record<string, string>
    deleteConfirm?: string
    applyConfirm?: string
    applySuccess?: string
  }
}

export interface DictionaryState<T extends BaseDictionaryItem> {
  items: T[]
  loading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
  search: string
  sortField: DictionarySortField
  sortDirection: DictionarySortDirection
  environment: DictionaryEnvironmentType
}

export interface DictionaryActions<T extends BaseDictionaryItem> {
  handleAdd: () => void
  handleCancelNew: () => void
  handleSaveNew: () => Promise<void>
  handleEdit: (item: T) => void
  handleCancelEdit: (item: T) => void
  handleSaveEdit: (item: T) => Promise<void>
  handleDelete: (id: number) => Promise<void>
  handleApplyChanges?: (environment: DictionaryEnvironmentType) => Promise<void>
  handleSort: (field: DictionarySortField) => void
  handleSearch: (value: string) => void
  handlePageChange: (page: number) => void
  handleEnvironmentChange: (env: DictionaryEnvironmentType) => void
  refetch: () => Promise<void>
}

export interface DictionaryFieldRendererProps<T extends BaseDictionaryItem> {
  item: T
  isEditing: boolean
  editingValues: Partial<T>
  onEditingChange: (field: keyof T, value: any) => void
  config: DictionaryConfig<T>
}

export type DictionaryConfigs = {
  [K in DictionaryType]: K extends 'user' ? DictionaryConfig<UserDictionaryItem> :
    K extends 'stopword' ? DictionaryConfig<StopwordDictionaryItem> :
    K extends 'synonym' ? DictionaryConfig<SynonymDictionaryItem> :
    K extends 'typo' ? DictionaryConfig<TypoDictionaryItem> :
    never
}