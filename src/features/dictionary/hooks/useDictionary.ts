import { useState, useCallback } from 'react'
import { useDictionaryData } from './useDictionaryData'
import { useDictionaryActions } from './useDictionaryActions'
import type { DictionaryType, BaseDictionaryItem, DictionaryState } from '../types/dictionary.types'
import type { DictionaryEnvironmentType, DictionarySortField, DictionarySortDirection } from '@/types/dashboard'

interface UseDictionaryParams {
  environment: DictionaryEnvironmentType
  page: number
  search: string
  pageSize: number
}

export function useDictionary<T extends BaseDictionaryItem = BaseDictionaryItem>(
  type: DictionaryType,
  params: UseDictionaryParams
) {
  const [sortField, setSortField] = useState<DictionarySortField>('updatedAt')
  const [sortDirection, setSortDirection] = useState<DictionarySortDirection>('desc')
  
  const { data, isLoading, error, refetch } = useDictionaryData<T>({
    type,
    ...params,
    sortField,
    sortDirection
  })
  
  const actionsAndState = useDictionaryActions<T>({
    type,
    environment: params.environment,
    refetch: () => refetch()
  })
  
  const handleSort = useCallback((field: DictionarySortField) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }, [sortField])
  
  const state: DictionaryState<T> = {
    items: data?.content || [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
    total: data?.totalElements || 0,
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
    sortField,
    sortDirection,
    environment: params.environment
  }
  
  return {
    state: {
      ...state,
      editingState: actionsAndState.editingState
    },
    actions: {
      ...actionsAndState,
      handleSort,
      setEditingState: actionsAndState.setEditingState
    }
  }
}