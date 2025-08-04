import { useState, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { realtimeSyncApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { getDictionaryConfig } from '../configs/dictionaryConfigs'
import type { DictionaryType, BaseDictionaryItem, DictionaryActions } from '../types/dictionary.types'
import type { DictionaryEnvironmentType } from '@/types/dashboard'

interface UseDictionaryActionsParams {
  type: DictionaryType
  environment: DictionaryEnvironmentType
  refetch: () => void
}

interface EditingState<T extends BaseDictionaryItem> {
  addingItem: boolean
  newItem: Partial<T>
  editingItem: Partial<T>
  highlightedId: number | null
}

export function useDictionaryActions<T extends BaseDictionaryItem>({
  type,
  refetch
}: UseDictionaryActionsParams): DictionaryActions<T> & { editingState: EditingState<T>, setEditingState: React.Dispatch<React.SetStateAction<EditingState<T>>> } {
  const config = getDictionaryConfig(type)
  const { toast } = useToast()
  
  const [editingState, setEditingState] = useState<EditingState<T>>({
    addingItem: false,
    newItem: {},
    editingItem: {},
    highlightedId: null
  })

  const validateItem = useCallback((item: Partial<T>): string | null => {
    for (const field of config.fields) {
      const validator = config.validation[field as keyof typeof config.validation]
      if (validator && field in item && item[field as keyof T] !== undefined) {
        const isValid = (validator as any)(item[field as keyof T])
        if (!isValid) {
          return config.messages.validationError[field as string] || '유효하지 않은 입력입니다.'
        }
      }
    }
    return null
  }, [config])

  const handleAdd = useCallback(() => {
    setEditingState(prev => ({ 
      ...prev, 
      addingItem: true, 
      newItem: {} 
    }))
  }, [])

  const handleCancelNew = useCallback(() => {
    setEditingState(prev => ({ 
      ...prev, 
      addingItem: false, 
      newItem: {} 
    }))
  }, [])

  const handleSaveNew = useCallback(async () => {
    const error = validateItem(editingState.newItem)
    if (error) {
      toast({
        title: '입력 오류',
        description: error,
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await apiClient.post<T>(
        `/v1/dictionaries${config.apiPath}`,
        editingState.newItem
      )
      
      setEditingState(prev => ({ 
        ...prev, 
        addingItem: false, 
        newItem: {},
        highlightedId: response.id
      }))
      
      setTimeout(() => {
        setEditingState(prev => ({ ...prev, highlightedId: null }))
      }, 2000)
      
      toast({
        title: '추가 완료',
        description: '사전 항목이 추가되었습니다.'
      })
      
      refetch()
    } catch (error) {
      toast({
        title: '추가 실패',
        description: error instanceof Error ? error.message : '사전 항목 추가에 실패했습니다.',
        variant: 'destructive'
      })
    }
  }, [editingState.newItem, config, refetch, toast, validateItem])

  const handleEdit = useCallback((item: T) => {
    setEditingState(prev => ({ 
      ...prev, 
      editingItem: { ...item } 
    }))
  }, [])

  const handleCancelEdit = useCallback((_item: T) => {
    setEditingState(prev => ({ 
      ...prev, 
      editingItem: {} 
    }))
  }, [])

  const handleSaveEdit = useCallback(async (item: T) => {
    const error = validateItem(editingState.editingItem)
    if (error) {
      toast({
        title: '입력 오류',
        description: error,
        variant: 'destructive'
      })
      return
    }

    try {
      await apiClient.put(
        `/v1/dictionaries${config.apiPath}/${item.id}`,
        editingState.editingItem
      )
      
      setEditingState(prev => ({ 
        ...prev, 
        editingItem: {},
        highlightedId: item.id
      }))
      
      setTimeout(() => {
        setEditingState(prev => ({ ...prev, highlightedId: null }))
      }, 2000)
      
      toast({
        title: '수정 완료',
        description: '사전 항목이 수정되었습니다.'
      })
      
      refetch()
    } catch (error) {
      toast({
        title: '수정 실패',
        description: error instanceof Error ? error.message : '사전 항목 수정에 실패했습니다.',
        variant: 'destructive'
      })
    }
  }, [editingState.editingItem, config, refetch, toast, validateItem])

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm(config.messages.deleteConfirm || '이 항목을 삭제하시겠습니까?')) {
      return
    }

    try {
      await apiClient.delete(`/v1/dictionaries${config.apiPath}/${id}`)
      
      toast({
        title: '삭제 완료',
        description: '사전 항목이 삭제되었습니다.'
      })
      
      refetch()
    } catch (error) {
      toast({
        title: '삭제 실패',
        description: error instanceof Error ? error.message : '사전 항목 삭제에 실패했습니다.',
        variant: 'destructive'
      })
    }
  }, [config, refetch, toast])

  const handleApplyChanges = useCallback(async (env: DictionaryEnvironmentType) => {
    if (!config.features.realtimeSync) {
      return
    }

    if (!confirm(config.messages.applyConfirm || '변경사항을 실시간으로 반영하시겠습니까?')) {
      return
    }

    try {
      if (type === 'synonym') {
        await realtimeSyncApi.syncSynonym(env)
      } else if (type === 'typo') {
        await realtimeSyncApi.syncTypoCorrection(env)
      }
      
      toast({
        title: '반영 완료',
        description: config.messages.applySuccess || '변경사항이 실시간으로 반영되었습니다.'
      })
    } catch (error) {
      toast({
        title: '반영 실패',
        description: error instanceof Error ? error.message : '실시간 반영에 실패했습니다.',
        variant: 'destructive'
      })
    }
  }, [config, type, toast])

  const handleSort = useCallback((_field: any) => {
    // This will be handled by the parent component
  }, [])

  const handleSearch = useCallback((_value: string) => {
    // This will be handled by the parent component
  }, [])

  const handlePageChange = useCallback((_page: number) => {
    // This will be handled by the parent component
  }, [])

  const handleEnvironmentChange = useCallback((_env: DictionaryEnvironmentType) => {
    // This will be handled by the parent component
  }, [])

  return {
    editingState,
    setEditingState,
    handleAdd,
    handleCancelNew,
    handleSaveNew,
    handleEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleDelete,
    handleApplyChanges: config.features.realtimeSync ? handleApplyChanges : undefined,
    handleSort,
    handleSearch,
    handlePageChange,
    handleEnvironmentChange,
    refetch: async () => { refetch() }
  }
}