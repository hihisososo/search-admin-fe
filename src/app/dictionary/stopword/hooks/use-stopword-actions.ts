import { useState, useCallback } from 'react'
import { apiFetch } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import type { DictionaryItem } from '@/types/dashboard'

interface UseStopwordActionsReturn {
  addingItem: boolean
  setAddingItem: (value: boolean) => void
  newKeyword: string
  setNewKeyword: (value: string) => void
  editingKeyword: string
  setEditingKeyword: (value: string) => void
  highlightedId: number | null
  error: string
  setError: (value: string) => void
  handleAdd: () => void
  handleSaveNew: () => Promise<void>
  handleCancelNew: () => void
  handleEdit: (item: DictionaryItem, items: DictionaryItem[]) => DictionaryItem[]
  handleSaveEdit: (item: DictionaryItem, items: DictionaryItem[]) => Promise<DictionaryItem[]>
  handleCancelEdit: (item: DictionaryItem, items: DictionaryItem[]) => DictionaryItem[]
  handleDelete: (id: number) => Promise<void>
  validateKeyword: (keyword: string) => boolean
}

export function useStopwordActions(onRefetch: () => void): UseStopwordActionsReturn {
  const { toast } = useToast()
  const [addingItem, setAddingItem] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  const [editingKeyword, setEditingKeyword] = useState('')
  const [highlightedId, setHighlightedId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const validateKeyword = useCallback((keyword: string): boolean => {
    const trimmed = keyword.trim()
    return trimmed !== '' && !trimmed.includes(',') && !trimmed.includes('=')
  }, [])

  const handleAdd = useCallback(() => {
    setAddingItem(true)
    setNewKeyword('')
  }, [])

  const handleSaveNew = useCallback(async () => {
    if (!validateKeyword(newKeyword)) {
      setError('불용어는 단일 단어로 입력해주세요. (콤마나 특수문자 불가)')
      return
    }
    
    const response = await apiFetch<DictionaryItem>('/v1/dictionaries/stopword', {
      method: 'POST',
      body: JSON.stringify({ keyword: newKeyword.trim() })
    })
    
    setAddingItem(false)
    setNewKeyword('')
    setError('')
    setHighlightedId(response.id)
    setTimeout(() => setHighlightedId(null), 3000)
    await onRefetch()
  }, [newKeyword, validateKeyword, onRefetch])

  const handleCancelNew = useCallback(() => {
    setAddingItem(false)
    setNewKeyword('')
    setError('')
  }, [])

  const handleEdit = useCallback((item: DictionaryItem, items: DictionaryItem[]): DictionaryItem[] => {
    setEditingKeyword(item.keyword)
    return items.map(i => ({
      ...i,
      isEditing: i.id === item.id
    }))
  }, [])

  const handleSaveEdit = useCallback(async (item: DictionaryItem, items: DictionaryItem[]): Promise<DictionaryItem[]> => {
    if (!validateKeyword(editingKeyword)) {
      setError('불용어는 단일 단어로 입력해주세요. (콤마나 특수문자 불가)')
      throw new Error('Invalid keyword format')
    }
    
    const response = await apiFetch<DictionaryItem>(`/v1/dictionaries/stopword/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify({ keyword: editingKeyword.trim() })
    })
    
    setError('')
    setHighlightedId(response.id)
    setTimeout(() => setHighlightedId(null), 3000)
    
    return items.map(i => 
      i.id === item.id 
        ? { ...response, isEditing: false }
        : i
    )
  }, [editingKeyword, validateKeyword])

  const handleCancelEdit = useCallback((item: DictionaryItem, items: DictionaryItem[]): DictionaryItem[] => {
    setError('')
    return items.map(i => ({
      ...i,
      isEditing: false
    }))
  }, [])

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('정말로 삭제하시겠습니까?')) return
    
    await apiFetch(`/v1/dictionaries/stopword/${id}`, { method: 'DELETE' })
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
    editingKeyword,
    setEditingKeyword,
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
    validateKeyword
  }
}