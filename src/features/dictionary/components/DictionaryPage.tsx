'use client'

import { useState } from 'react'
import { DictionaryHeader } from './DictionaryHeader'
import { DictionaryTable } from './DictionaryTable'
import { useDictionary } from '../hooks/useDictionary'
import { getDictionaryConfig } from '../configs/dictionaryConfigs'
import type { DictionaryType, BaseDictionaryItem } from '../types/dictionary.types'
import type { DictionaryEnvironmentType } from '@/types/dashboard'
import { Pagination } from '@/components/ui/pagination'

interface DictionaryPageProps {
  type: DictionaryType
}

export function DictionaryPage({ type }: DictionaryPageProps) {
  const [environment, setEnvironment] = useState<DictionaryEnvironmentType>('CURRENT' as DictionaryEnvironmentType)
  const config = getDictionaryConfig(type)
  const canEdit = environment === 'CURRENT'
  
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
        onEnvironmentChange={setEnvironment}
        onSearchChange={setSearch}
        onAdd={actions.handleAdd}
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