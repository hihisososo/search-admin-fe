import { useState, useCallback } from 'react'
import { apiFetch } from '@/lib/api'
import { synonymDictionaryService } from '@/services'
import { useToast } from '@/components/ui/use-toast'
import type { DictionaryItem, DictionaryEnvironmentType } from '@/types/dashboard'

interface UseSynonymActionsReturn {
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
  handleApplyChanges: (environment: DictionaryEnvironmentType) => Promise<void>
  validateKeyword: (keyword: string) => boolean
}

export function useSynonymActions(onRefetch: () => Promise<void>): UseSynonymActionsReturn {
  const { toast } = useToast()
  const [addingItem, setAddingItem] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  const [editingKeyword, setEditingKeyword] = useState('')
  const [highlightedId, setHighlightedId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const validateKeyword = useCallback((keyword: string): boolean => {
    const trimmed = keyword.trim()
    if (trimmed === '') return false
    
    const hasArrow = trimmed.includes('=>')
    const hasComma = trimmed.includes(',') && !hasArrow
    
    return hasArrow || hasComma
  }, [])

  const handleAdd = useCallback(() => {
    setAddingItem(true)
    setNewKeyword('')
  }, [])

  const handleApplyChanges = useCallback(async (environment: DictionaryEnvironmentType) => {
    const response = await synonymDictionaryService.realtimeSync(environment)
    toast({
      title: "실시간 반영 완료",
      description: response.message || '동의어 사전이 실시간으로 반영되었습니다.'
    })
  }, [toast])

  const handleSaveNew = useCallback(async () => {
    if (!validateKeyword(newKeyword)) {
      setError('올바른 형식으로 입력해주세요.\n단방향: 휴대폰 => 핸드폰,모바일,스마트폰\n양방향: 휴대폰,핸드폰,모바일,스마트폰')
      return
    }
    
    const response = await apiFetch<DictionaryItem>('/api/v1/dictionaries/synonym', {
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
      setError('올바른 형식으로 입력해주세요.\n단방향: 휴대폰 => 핸드폰,모바일,스마트폰\n양방향: 휴대폰,핸드폰,모바일,스마트폰')
      throw new Error('Invalid keyword format')
    }
    
    const response = await apiFetch<DictionaryItem>(`/api/v1/dictionaries/synonym/${item.id}`, {
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
    
    await apiFetch(`/api/v1/dictionaries/synonym/${id}`, { method: 'DELETE' })
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
    handleApplyChanges,
    validateKeyword
  }
}