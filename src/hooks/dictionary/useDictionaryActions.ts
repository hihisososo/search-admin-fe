import { useState, useCallback } from "react"
import type { DictionaryItem } from "@/types/dashboard"

interface UseDictionaryActionsOptions<T extends DictionaryItem> {
  refetch: () => void
  validateItem: (item: Partial<T>) => string | null
  createItem: (item: Partial<T>) => Promise<T>
  updateItem: (id: number, item: Partial<T>) => Promise<T>
  deleteItem: (id: number) => Promise<void>
  applyChanges?: (environment: string) => Promise<void>
}

export function useDictionaryActions<T extends DictionaryItem>(
  options: UseDictionaryActionsOptions<T>
) {
  const [addingItem, setAddingItem] = useState(false)
  const [newItem, setNewItem] = useState<Partial<T>>({})
  const [editingItem, setEditingItem] = useState<Partial<T>>({})
  const [highlightedId, setHighlightedId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = useCallback(() => {
    setAddingItem(true)
    setNewItem({})
    setError(null)
  }, [])

  const handleCancelNew = useCallback(() => {
    setAddingItem(false)
    setNewItem({})
    setError(null)
  }, [])

  const handleSaveNew = useCallback(async () => {
    const validationError = options.validateItem(newItem)
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      const created = await options.createItem(newItem)
      setAddingItem(false)
      setNewItem({})
      setError(null)
      setHighlightedId(created.id)
      setTimeout(() => setHighlightedId(null), 2000)
      options.refetch()
    } catch (error) {
      setError(error instanceof Error ? error.message : "추가 실패")
    }
  }, [newItem, options])

  const handleEdit = useCallback((item: T, items: T[]) => {
    setEditingItem(item)
    setError(null)
    return items.map(i => ({
      ...i,
      isEditing: i.id === item.id
    }))
  }, [])

  const handleCancelEdit = useCallback((item: T, items: T[]) => {
    setEditingItem({})
    setError(null)
    return items.map(i => ({
      ...i,
      isEditing: false
    }))
  }, [])

  const handleSaveEdit = useCallback(async (item: T, items: T[]) => {
    const validationError = options.validateItem(editingItem)
    if (validationError) {
      throw new Error(validationError)
    }

    await options.updateItem(item.id, editingItem)
    setEditingItem({})
    setHighlightedId(item.id)
    setTimeout(() => setHighlightedId(null), 2000)
    options.refetch()
    return items.map(i => ({
      ...i,
      isEditing: false
    }))
  }, [editingItem, options])

  const handleDelete = useCallback(async (item: T) => {
    if (!confirm(`"${item.keyword}"를 삭제하시겠습니까?`)) {
      return
    }

    try {
      await options.deleteItem(item.id)
      options.refetch()
    } catch (error) {
      alert(error instanceof Error ? error.message : "삭제 실패")
    }
  }, [options])

  const handleApplyChanges = useCallback(async (environment: string) => {
    if (!options.applyChanges) {
      throw new Error("실시간 반영이 지원되지 않습니다.")
    }

    if (!confirm("변경사항을 실시간으로 반영하시겠습니까?")) {
      return
    }

    await options.applyChanges(environment)
    alert("실시간 반영이 완료되었습니다.")
  }, [options])

  return {
    addingItem,
    newItem,
    editingItem,
    highlightedId,
    error,
    setNewItem,
    setEditingItem,
    setError,
    handleAdd,
    handleCancelNew,
    handleSaveNew,
    handleEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleDelete,
    handleApplyChanges
  }
}