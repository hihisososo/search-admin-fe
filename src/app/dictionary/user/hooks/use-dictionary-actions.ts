import { useState, useCallback } from 'react'
import { apiFetch } from '@/lib/api'
import type { DictionaryItem } from '@/types/dashboard'

interface UseDictionaryActionsParams {
  refetch: () => Promise<void>
}

export function useDictionaryActions({ refetch }: UseDictionaryActionsParams) {
  const [addingItem, setAddingItem] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingKeyword, setEditingKeyword] = useState('')
  const [highlightedId, setHighlightedId] = useState<number | null>(null)

  const setHighlight = useCallback((id: number) => {
    setHighlightedId(id)
    setTimeout(() => setHighlightedId(null), 3000)
  }, [])

  const validateKeyword = useCallback((keyword: string): boolean => {
    return keyword.trim() !== ''
  }, [])

  const handleAdd = useCallback(() => {
    setAddingItem(true)
    setNewKeyword('')
  }, [])

  const handleSaveNew = useCallback(async () => {
    if (!validateKeyword(newKeyword)) {
      throw new Error('키워드를 입력해주세요.')
    }

    const response = await apiFetch<DictionaryItem>('/api/v1/dictionaries/user', {
      method: 'POST',
      body: JSON.stringify({
        keyword: newKeyword.trim(),
      }),
    })

    setAddingItem(false)
    setNewKeyword('')
    setHighlight(response.id)
    await refetch()
  }, [newKeyword, refetch, setHighlight, validateKeyword])

  const handleCancelNew = useCallback(() => {
    setAddingItem(false)
    setNewKeyword('')
  }, [])

  const handleEdit = useCallback((item: DictionaryItem) => {
    setEditingId(item.id)
    setEditingKeyword(item.keyword)
  }, [])

  const handleSaveEdit = useCallback(async (item: DictionaryItem) => {
    if (!validateKeyword(editingKeyword)) {
      throw new Error('키워드를 입력해주세요.')
    }

    const response = await apiFetch<DictionaryItem>(
      `/api/v1/dictionaries/user/${item.id}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          keyword: editingKeyword.trim(),
        }),
      }
    )

    setEditingId(null)
    setEditingKeyword('')
    setHighlight(response.id)
    await refetch()
  }, [editingKeyword, refetch, setHighlight, validateKeyword])

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditingKeyword('')
  }, [])

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('정말로 삭제하시겠습니까?')) return

    try {
      await apiFetch(`/api/v1/dictionaries/user/${id}`, { method: 'DELETE' })
      alert('사전 항목이 성공적으로 삭제되었습니다.')
      await refetch()
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 실패')
    }
  }, [refetch])

  return {
    addingItem,
    newKeyword,
    editingId,
    editingKeyword,
    highlightedId,
    setNewKeyword,
    setEditingKeyword,
    handleAdd,
    handleSaveNew,
    handleCancelNew,
    handleEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
  }
}