import { useState, useCallback } from 'react'
import { synonymDictionaryService, typoCorrectionDictionaryService, stopwordDictionaryService, userDictionaryService, unitDictionaryService } from '@/services'
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
  selectedIds: Set<number>
}

export function useDictionaryActions<T extends BaseDictionaryItem>({
  type,
  environment,
  refetch
}: UseDictionaryActionsParams): DictionaryActions<T> & { editingState: EditingState<T>, setEditingState: React.Dispatch<React.SetStateAction<EditingState<T>>> } {
  const config = getDictionaryConfig(type)
  const { toast } = useToast()
  
  const [editingState, setEditingState] = useState<EditingState<T>>({
    addingItem: false,
    newItem: {},
    editingItem: {},
    highlightedId: null,
    selectedIds: new Set()
  })

  const validateItem = useCallback((item: Partial<T>): string | null => {
    for (const field of config.fields) {
      const validator = config.validation[field as keyof typeof config.validation]
      if (validator && field in item && item[field as keyof T] !== undefined) {
        const fieldValue = item[field as keyof T]
        const isValid = typeof validator === 'function' ? (validator as (value: unknown) => boolean)(fieldValue) : false
        if (!isValid) {
          return config.messages.validationError[field as string] || '유효하지 않은 입력입니다.'
        }
      }
    }
    return null
  }, [config.fields, config.messages.validationError, config.validation])

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
      const service =
        type === 'user' ? userDictionaryService :
        type === 'stopword' ? stopwordDictionaryService :
        type === 'synonym' ? synonymDictionaryService :
        type === 'unit' ? unitDictionaryService :
        typoCorrectionDictionaryService

      // 오타교정은 분리된 필드로 전송(keyword/correctedWord)
      const payload = type === 'typo'
        ? {
            keyword: String((editingState.newItem as T).keyword || '').trim(),
            correctedWord: String((editingState.newItem as T & {correctedWord?: string}).correctedWord || '').trim(),
            description: (editingState.newItem as T & {description?: string}).description,
          }
        : editingState.newItem

      const response = await (service.create as (payload: any, env: any) => Promise<any>)(payload, environment)
      
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
  }, [editingState.newItem, refetch, toast, validateItem, environment, type])

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
      const service =
        type === 'user' ? userDictionaryService :
        type === 'stopword' ? stopwordDictionaryService :
        type === 'synonym' ? synonymDictionaryService :
        type === 'unit' ? unitDictionaryService :
        typoCorrectionDictionaryService

      // 오타교정은 분리된 필드로 전송(keyword/correctedWord)
      const payload = type === 'typo'
        ? {
            keyword: String((editingState.editingItem as T).keyword || (item as T).keyword || '').trim(),
            correctedWord: String((editingState.editingItem as T & {correctedWord?: string}).correctedWord || (item as T & {correctedWord?: string}).correctedWord || '').trim(),
            description: (editingState.editingItem as T & {description?: string}).description,
          }
        : {
            keyword: (editingState.editingItem as T).keyword,
            description: (editingState.editingItem as T & {description?: string}).description
          }

      await (service.update as (id: number, payload: any, env: any) => Promise<any>)(item.id, payload, environment)
      
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
  }, [editingState.editingItem, refetch, toast, validateItem, environment, type])

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm(config.messages.deleteConfirm || '이 항목을 삭제하시겠습니까?')) {
      return
    }

    try {
      const service =
        type === 'user' ? userDictionaryService :
        type === 'stopword' ? stopwordDictionaryService :
        type === 'synonym' ? synonymDictionaryService :
        type === 'unit' ? unitDictionaryService :
        typoCorrectionDictionaryService

      await service.delete(id, environment)
      
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
  }, [config, refetch, toast, environment, type])

  const handleDeleteSelected = useCallback(async () => {
    const selectedCount = editingState.selectedIds.size
    if (selectedCount === 0) return
    
    if (!confirm(`선택한 ${selectedCount}개 항목을 삭제하시겠습니까?`)) {
      return
    }

    try {
      const service =
        type === 'user' ? userDictionaryService :
        type === 'stopword' ? stopwordDictionaryService :
        type === 'synonym' ? synonymDictionaryService :
        type === 'unit' ? unitDictionaryService :
        typoCorrectionDictionaryService

      await service.bulkDelete(Array.from(editingState.selectedIds), environment)
      
      setEditingState(prev => ({ 
        ...prev, 
        selectedIds: new Set() 
      }))
      
      toast({
        title: '삭제 완료',
        description: `${selectedCount}개 항목이 삭제되었습니다.`
      })
      
      refetch()
    } catch (error) {
      toast({
        title: '삭제 실패',
        description: error instanceof Error ? error.message : '선택한 항목 삭제에 실패했습니다.',
        variant: 'destructive'
      })
    }
  }, [editingState.selectedIds, config.messages.deleteConfirm, refetch, toast, environment, type])

  const handleApplyChanges = useCallback(async (env: DictionaryEnvironmentType) => {
    if (!config.features.realtimeSync) {
      return
    }

    // 현재 환경에서는 실시간 반영 불가
    if (env === 'CURRENT') {
      toast({
        title: '실시간 반영 불가',
        description: '현재 환경에서는 실시간 반영을 할 수 없습니다. 개발 또는 운영 환경을 선택해주세요.',
        variant: 'destructive'
      })
      return
    }

    if (!confirm(config.messages.applyConfirm || '변경사항을 실시간으로 반영하시겠습니까?')) {
      return
    }

    try {
      if (type === 'synonym') {
        await synonymDictionaryService.realtimeSync(env)
      } else if (type === 'typo') {
        await typoCorrectionDictionaryService.realtimeSync(env)
      } else if (type === 'unit') {
        await unitDictionaryService.realtimeSync(env)
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
  }, [config.features.realtimeSync, config.messages.applyConfirm, config.messages.applySuccess, type, toast])

  const handleSort = useCallback((_field: string) => {
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
    handleDeleteSelected,
    handleApplyChanges: config.features.realtimeSync ? handleApplyChanges : undefined,
    handleSort,
    handleSearch,
    handlePageChange,
    handleEnvironmentChange,
    refetch: async () => { refetch() }
  }
}