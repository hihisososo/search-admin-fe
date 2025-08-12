// SPA 환경에서는 'use client' 지시어 불필요

import { useMemo, useState } from 'react'
import { DictionaryHeader } from './DictionaryHeader'
import { DictionaryTable } from './DictionaryTable'
import { useDictionary } from '../hooks/useDictionary'
import { getDictionaryConfig } from '../configs/dictionaryConfigs'
import type { DictionaryType } from '../types/dictionary.types'
import type { DictionaryEnvironmentType } from '@/types/dashboard'
import { PaginationControls } from '@/components/common/PaginationControls'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PAGINATION } from '@/constants/pagination'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface DictionaryPageProps {
  type: DictionaryType
}

export function DictionaryPage({ type }: DictionaryPageProps) {
  const [environment, setEnvironment] = useState<DictionaryEnvironmentType>('CURRENT' as DictionaryEnvironmentType)
  const config = getDictionaryConfig(type)
  // 동의어, 오타교정 사전은 실시간 반영이 있으므로 모든 환경에서 편집 가능
  const canEdit = (type === 'synonym' || type === 'typo') ? true : environment === 'CURRENT'
  
  const [page, setPage] = useState(1)
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

      {/* 검색 입력창 - 데이터 테이블 바로 위 배치 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1 w-full max-w-lg">
          <Input
            placeholder="검색어를 입력하세요"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearch(searchInput)
              }
            }}
            className="h-9 flex-1"
          />
          <Button
            onClick={() => setSearch(searchInput)}
            disabled={state.loading}
            className={`${environment === 'PROD' ? 'bg-gray-800' : 'bg-blue-600'} px-4 h-9 hover:opacity-90`}
          >
            {state.loading ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select value={pageSize.toString()} onValueChange={(value) => { setPageSize(Number(value)); setPage(1) }}>
            <SelectTrigger className="w-24 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-xs">
              {PAGINATION.AVAILABLE_PAGE_SIZES.map(size => (
                <SelectItem key={size} value={size.toString()} className="text-xs py-1">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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
            currentPage={page - 1}
            totalPages={totalPages}
            totalCount={state.total}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p + 1)}
            onPageSizeChange={(ps) => { setPageSize(ps); setPage(1) }}
          />
        </div>
      )}
      {totalPages <= 1 && (
        <div className="mt-2">
          <PaginationControls
            currentPage={page - 1}
            totalPages={Math.max(1, totalPages)}
            totalCount={state.total}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p + 1)}
            onPageSizeChange={(ps) => { setPageSize(ps); setPage(1) }}
          />
        </div>
      )}
    </div>
  )
}