// SPA 환경에서는 'use client' 지시어 불필요

import { useMemo, useState } from 'react'
import { DictionaryHeader } from './DictionaryHeader'
import { DictionaryTable } from './DictionaryTable'
import { useDictionary } from '../hooks/useDictionary'
import { getDictionaryConfig } from '../configs/dictionaryConfigs'
import type { DictionaryType } from '../types/dictionary.types'
import { Environment as DictionaryEnvironmentType } from '@/services/common/types'
import { PaginationControls } from '@/components/common/PaginationControls'
import { DataTableToolbar } from '@/components/common/DataTableToolbar'

interface DictionaryPageProps {
  type: DictionaryType
}

export function DictionaryPage({ type }: DictionaryPageProps) {
  const [environment, setEnvironment] = useState<DictionaryEnvironmentType>('CURRENT' as DictionaryEnvironmentType)
  const config = getDictionaryConfig(type)
  // 동의어, 오타교정 사전은 실시간 반영이 있으므로 모든 환경에서 편집 가능
  const canEdit = (type === 'synonym' || type === 'typo') ? true : environment === 'CURRENT'
  
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  
  const { state, actions } = useDictionary(type, {
    environment,
    page,
    search,
    pageSize
  })
  
  const totalPages = useMemo(() => {
    if (state.total <= 0) return 0
    return Math.ceil(state.total / pageSize)
  }, [state.total, pageSize])
  
  return (
    <div className="p-6 space-y-4">
      <DictionaryHeader
        config={config as any}
        canEdit={canEdit}
        environment={environment}
        selectedCount={state.editingState.selectedIds.size}
        onEnvironmentChange={setEnvironment}
        onAdd={actions.handleAdd}
        onDeleteSelected={actions.handleDeleteSelected}
        onApplyChanges={config.features.realtimeSync ? actions.handleApplyChanges : undefined}
      />

      <DataTableToolbar
        showSearch
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearch={() => {
          setSearch(searchInput)
          setPage(0)  // 검색 시 첫 페이지로 이동
        }}
        totalCount={state.total}
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageSizeChange={(ps) => { setPageSize(ps); setPage(0) }}
        environment={environment}
      />

      <DictionaryTable
        type={type}
        config={config as any}
        items={state.items}
        loading={state.loading}
        error={state.error}
        canEdit={canEdit}
        sortField={state.sortField}
        sortDirection={state.sortDirection}
        onSort={actions.handleSort}
        actions={actions}
        editingState={state.editingState}
        setEditingState={actions.setEditingState}
      />
      
      {totalPages > 1 && (
        <div className="mt-2">
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            totalCount={state.total}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(ps) => { setPageSize(ps); setPage(0) }}
          />
        </div>
      )}
      {totalPages <= 1 && (
        <div className="mt-2">
          <PaginationControls
            currentPage={page}
            totalPages={Math.max(1, totalPages)}
            totalCount={state.total}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(ps) => { setPageSize(ps); setPage(0) }}
          />
        </div>
      )}
    </div>
  )
}