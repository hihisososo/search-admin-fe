'use client'

import { useState } from 'react'
import { DictionaryHeader } from './DictionaryHeader'
import { DictionaryTable } from './DictionaryTable'
import { useDictionary } from '../hooks/useDictionary'
import { getDictionaryConfig } from '../configs/dictionaryConfigs'
import type { DictionaryType } from '../types/dictionary.types'
import type { DictionaryEnvironmentType } from '@/types/dashboard'
import { Pagination } from '@/components/ui/pagination'

interface DictionaryPageProps {
  type: DictionaryType
}

export function DictionaryPage({ type }: DictionaryPageProps) {
  const [environment, setEnvironment] = useState<DictionaryEnvironmentType>('CURRENT' as DictionaryEnvironmentType)
  const config = getDictionaryConfig(type)
  // 유의어, 오타교정 사전은 실시간 반영이 있으므로 모든 환경에서 편집 가능
  const canEdit = (type === 'synonym' || type === 'typo') ? true : environment === 'CURRENT'
  
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  
  const { state, actions } = useDictionary(type, {
    environment,
    page,
    search,
    pageSize: 20
  })
  
  return (
    <div className="p-6">
      <DictionaryHeader
        config={config as any}
        canEdit={canEdit}
        environment={environment}
        search={search}
        selectedCount={state.editingState.selectedIds.size}
        onEnvironmentChange={setEnvironment}
        onSearchChange={setSearch}
        onAdd={actions.handleAdd}
        onDeleteSelected={actions.handleDeleteSelected}
        onApplyChanges={config.features.realtimeSync ? actions.handleApplyChanges : undefined}
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
      
      {state.total > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(state.total / state.pageSize)}
            totalItems={state.total}
            itemsPerPage={state.pageSize}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}