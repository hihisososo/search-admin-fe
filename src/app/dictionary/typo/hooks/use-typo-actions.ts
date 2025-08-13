import { useState, useCallback } from 'react'
import { typoCorrectionDictionaryApi } from '@/lib/api'
import { typoCorrectionDictionaryService } from '@/services'
import { useToast } from '@/components/ui/use-toast'
import type { DictionaryEnvironmentType } from '@/types/dashboard'
import type { TypoCorrectionDictionaryItem } from '@/services/dictionary/types'

interface UseTypoActionsReturn {
  addingItem: boolean
  setAddingItem: (value: boolean) => void
  newKeyword: string
  setNewKeyword: (value: string) => void
  newCorrectedWord: string
  setNewCorrectedWord: (value: string) => void
  editingKeyword: string
  setEditingKeyword: (value: string) => void
  editingCorrectedWord: string
  setEditingCorrectedWord: (value: string) => void
  highlightedId: number | null
  error: string
  setError: (value: string) => void
  handleAdd: () => void
  handleSaveNew: () => Promise<void>
  handleCancelNew: () => void
  handleEdit: (item: TypoCorrectionDictionaryItem, items: TypoCorrectionDictionaryItem[]) => TypoCorrectionDictionaryItem[]
  handleSaveEdit: (item: TypoCorrectionDictionaryItem, items: TypoCorrectionDictionaryItem[]) => Promise<TypoCorrectionDictionaryItem[]>
  handleCancelEdit: (item: TypoCorrectionDictionaryItem, items: TypoCorrectionDictionaryItem[]) => TypoCorrectionDictionaryItem[]
  handleDelete: (id: number) => Promise<void>
  handleApplyChanges: (environment: DictionaryEnvironmentType) => Promise<void>
  validateTypoCorrection: (keyword: string, correctedWord: string) => boolean
}

export function useTypoActions(onRefetch: () => Promise<void>): UseTypoActionsReturn {
  const { toast } = useToast()
  const [addingItem, setAddingItem] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  const [newCorrectedWord, setNewCorrectedWord] = useState('')
  const [editingKeyword, setEditingKeyword] = useState('')
  const [editingCorrectedWord, setEditingCorrectedWord] = useState('')
  const [highlightedId, setHighlightedId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const validateTypoCorrection = useCallback((keyword: string, correctedWord: string): boolean => {
    return keyword.trim() !== '' && correctedWord.trim() !== ''
  }, [])

  const handleAdd = useCallback(() => {
    setAddingItem(true)
    setNewKeyword('')
    setNewCorrectedWord('')
  }, [])

  const handleApplyChanges = useCallback(async (environment: DictionaryEnvironmentType) => {
    const response = await typoCorrectionDictionaryService.realtimeSync(environment)
    toast({
      title: "실시간 반영 완료",
      description: response.message || '오타교정 사전이 실시간으로 반영되었습니다.'
    })
  }, [toast])

  const handleSaveNew = useCallback(async () => {
    if (!validateTypoCorrection(newKeyword, newCorrectedWord)) {
      setError('오타 단어와 교정어를 모두 입력해주세요.')
      return
    }
    
    const response = await typoCorrectionDictionaryApi.create({ 
      typoWord: newKeyword.trim(),
      correctWord: newCorrectedWord.trim(),
      // keyword: `${newKeyword.trim()} => ${newCorrectedWord.trim()}` // 하위 호환 필요 시
    })
    
    setAddingItem(false)
    setNewKeyword('')
    setNewCorrectedWord('')
    setError('')
    setHighlightedId(response.id)
    setTimeout(() => setHighlightedId(null), 3000)
    await onRefetch()
  }, [newKeyword, newCorrectedWord, validateTypoCorrection, onRefetch])

  const handleCancelNew = useCallback(() => {
    setAddingItem(false)
    setNewKeyword('')
    setNewCorrectedWord('')
    setError('')
  }, [])

  const handleEdit = useCallback((item: TypoCorrectionDictionaryItem, items: TypoCorrectionDictionaryItem[]): TypoCorrectionDictionaryItem[] => {
    setEditingKeyword(item.keyword)
    setEditingCorrectedWord(item.correctedWord || (item as any).correctWord || '')
    return items.map(i => ({
      ...i,
      isEditing: i.id === item.id
    }))
  }, [])

  const handleSaveEdit = useCallback(async (item: TypoCorrectionDictionaryItem, items: TypoCorrectionDictionaryItem[]): Promise<TypoCorrectionDictionaryItem[]> => {
    if (!validateTypoCorrection(editingKeyword, editingCorrectedWord)) {
      setError('오타 단어와 교정어를 모두 입력해주세요.')
      throw new Error('Invalid typo correction format')
    }
    
    const response = await typoCorrectionDictionaryApi.update(item.id, { 
      typoWord: editingKeyword.trim(),
      correctWord: editingCorrectedWord.trim(),
      // keyword: `${editingKeyword.trim()} => ${editingCorrectedWord.trim()}` // 하위 호환 필요 시
    })
    
    setError('')
    setHighlightedId(response.id)
    setTimeout(() => setHighlightedId(null), 3000)
    
    return items.map(i => 
      i.id === item.id 
        ? response
        : i
    ) as TypoCorrectionDictionaryItem[]
  }, [editingKeyword, editingCorrectedWord, validateTypoCorrection])

  const handleCancelEdit = useCallback((item: TypoCorrectionDictionaryItem, items: TypoCorrectionDictionaryItem[]): TypoCorrectionDictionaryItem[] => {
    setError('')
    return items.map(i => ({
      ...i,
      isEditing: false
    }))
  }, [])

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('정말로 삭제하시겠습니까?')) return
    
    await typoCorrectionDictionaryApi.delete(id)
    toast({
      title: "삭제 완료",
      description: "사전 항목이 성공적으로 삭제되었습니다."
    })
    await onRefetch()
  }, [onRefetch])

  return {
    addingItem,
    setAddingItem,
    newKeyword,
    setNewKeyword,
    newCorrectedWord,
    setNewCorrectedWord,
    editingKeyword,
    setEditingKeyword,
    editingCorrectedWord,
    setEditingCorrectedWord,
    highlightedId,
    error,
    setError,
    handleAdd,
    handleSaveNew,
    handleCancelNew,
    handleEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
    handleApplyChanges,
    validateTypoCorrection
  }
}