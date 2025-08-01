import { useState, useCallback } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { DictionaryEnvironmentType } from '@/types/dashboard'
import { useDictionaryUser } from './hooks/use-dictionary-user'
import { useDictionaryActions } from './hooks/use-dictionary-actions'
import { EnvironmentSelector } from './components/EnvironmentSelector'
import { UserDictionaryHeader } from './components/UserDictionaryHeader'
import { UserDictionaryTable } from './components/UserDictionaryTable'
import { UserDictionaryPagination } from './components/UserDictionaryPagination'
import { ErrorMessage } from './components/ErrorMessage'
import { LoadingSpinner } from './components/LoadingSpinner'
import { EmptyState } from './components/EmptyState'
import type { DictionarySortField, DictionarySortDirection } from '@/types/dashboard'

export default function UserDictionary() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<DictionarySortField>('updatedAt')
  const [sortDirection, setSortDirection] = useState<DictionarySortDirection>('desc')
  const [environment, setEnvironment] = useState<DictionaryEnvironmentType>(
    DictionaryEnvironmentType.CURRENT
  )

  const { data, loading, error, refetch } = useDictionaryUser({
    page,
    search,
    sortField,
    sortDirection,
    environment,
  })

  const {
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
  } = useDictionaryActions({ refetch })

  const handleSort = useCallback(
    (field: DictionarySortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortField(field)
        setSortDirection('asc')
      }
      setPage(1)
    },
    [sortField]
  )

  const handleSearch = useCallback(() => {
    setPage(1)
  }, [])

  const handleEnvironmentChange = useCallback((newEnvironment: DictionaryEnvironmentType) => {
    setEnvironment(newEnvironment)
    setPage(1)
  }, [])

  const canEdit = environment === DictionaryEnvironmentType.CURRENT
  const items = data?.content || []
  const totalPages = Math.ceil((data?.totalElements || 0) / 20)

  return (
    <div className="p-4 space-y-4 bg-gray-50 min-h-screen">
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <EnvironmentSelector value={environment} onChange={handleEnvironmentChange} />
            </div>
          </div>
          <UserDictionaryHeader
            search={search}
            onSearchChange={setSearch}
            onSearch={handleSearch}
            onAdd={handleAdd}
            addingItem={addingItem}
            canEdit={canEdit}
          />
        </CardHeader>
        <CardContent className="pt-0">
          {error && <ErrorMessage message={error} />}

          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <UserDictionaryTable
                items={items.map(item => ({
                  ...item,
                  isEditing: item.id === editingId
                }))}
                addingItem={addingItem}
                newKeyword={newKeyword}
                editingKeyword={editingKeyword}
                highlightedId={highlightedId}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onEdit={handleEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onDelete={handleDelete}
                onNewKeywordChange={setNewKeyword}
                onEditingKeywordChange={setEditingKeyword}
                onSaveNew={handleSaveNew}
                onCancelNew={handleCancelNew}
                validateKeyword={(keyword: string) => keyword.trim() !== ''}
                canEdit={canEdit}
              />

              {items.length === 0 && !addingItem && <EmptyState />}

              {totalPages > 1 && (
                <UserDictionaryPagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}