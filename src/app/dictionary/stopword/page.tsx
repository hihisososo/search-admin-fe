import { useState, useCallback, useMemo, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { DictionaryEnvironmentType } from "@/types/dashboard"
import type { DictionaryItem, DictionarySortField, DictionarySortDirection } from "@/types/dashboard"
import { EnvironmentSelector } from "../user/components/EnvironmentSelector"
import { StopwordDictionaryHeader } from "./components/StopwordDictionaryHeader"
import { StopwordDictionaryTable } from "./components/StopwordDictionaryTable"
import { ErrorMessage, LoadingSpinner, EmptyState, DictionaryPagination } from "@/components/dictionary/common"
import { useDictionaryStopword } from "./hooks/use-dictionary-stopword"
import { useStopwordActions } from "./hooks/use-stopword-actions"
import { STOPWORD_CONSTANTS } from "./constants"

export default function StopwordDictionary() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [sortField, setSortField] = useState<DictionarySortField>('updatedAt')
    const [sortDirection, setSortDirection] = useState<DictionarySortDirection>('desc')
    const [environment, setEnvironment] = useState<DictionaryEnvironmentType>(DictionaryEnvironmentType.CURRENT)
    const [items, setItems] = useState<DictionaryItem[]>([])

    const { data, loading, error: fetchError, total, refetch } = useDictionaryStopword({
        page,
        search,
        sortField,
        sortDirection,
        environment
    })

    const {
        addingItem,
        newKeyword,
        setNewKeyword,
        editingKeyword,
        setEditingKeyword,
        highlightedId,
        error: actionError,
        setError,
        handleAdd,
        handleSaveNew,
        handleCancelNew,
        handleEdit,
        handleSaveEdit,
        handleCancelEdit,
        handleDelete,
        validateKeyword
    } = useStopwordActions(refetch)

    useEffect(() => {
        setItems(data)
    }, [data])

    const error = actionError || fetchError

    const handleSort = useCallback((field: DictionarySortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
        setPage(1)
    }, [sortField])

    const handleSearch = useCallback(() => {
        setPage(1)
    }, [])

    const handleEnvironmentChange = useCallback((newEnvironment: DictionaryEnvironmentType) => {
        setEnvironment(newEnvironment)
        setPage(1)
    }, [])

    const handleEditItem = useCallback((item: DictionaryItem) => {
        setItems(handleEdit(item, items))
    }, [handleEdit, items])

    const handleSaveEditItem = useCallback(async (item: DictionaryItem) => {
        try {
            const updatedItems = await handleSaveEdit(item, items)
            setItems(updatedItems)
        } catch (err) {
            setError(err instanceof Error ? err.message : "수정 실패")
        }
    }, [handleSaveEdit, items, setError])

    const handleCancelEditItem = useCallback((item: DictionaryItem) => {
        setItems(handleCancelEdit(item, items))
    }, [handleCancelEdit, items])

    const totalPages = useMemo(() => Math.ceil(total / STOPWORD_CONSTANTS.PAGE_SIZE), [total])
    const canEdit = useMemo(() => environment === DictionaryEnvironmentType.CURRENT, [environment])

    return (
        <div className="p-4 space-y-4 bg-gray-50 min-h-screen">
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="pb-1">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <EnvironmentSelector
                                value={environment}
                                onChange={handleEnvironmentChange}
                            />
                        </div>
                    </div>
                    <StopwordDictionaryHeader
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
                            <StopwordDictionaryTable
                                items={items}
                                addingItem={addingItem}
                                newKeyword={newKeyword}
                                editingKeyword={editingKeyword}
                                highlightedId={highlightedId}
                                sortField={sortField}
                                sortDirection={sortDirection}
                                onSort={handleSort}
                                onEdit={handleEditItem}
                                onSaveEdit={handleSaveEditItem}
                                onCancelEdit={handleCancelEditItem}
                                onDelete={handleDelete}
                                onNewKeywordChange={setNewKeyword}
                                onEditingKeywordChange={setEditingKeyword}
                                onSaveNew={handleSaveNew}
                                onCancelNew={handleCancelNew}
                                validateKeyword={validateKeyword}
                                canEdit={canEdit}
                            />

                            {items.length === 0 && !addingItem && <EmptyState />}

                            <DictionaryPagination
                                currentPage={page}
                                totalPages={totalPages}
                                itemsPerPage={STOPWORD_CONSTANTS.PAGE_SIZE}
                                totalItems={total}
                                onPageChange={setPage}
                                onItemsPerPageChange={() => {}}
                            />
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}