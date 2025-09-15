'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast'
import { categoryRankingService } from '@/services/dictionary/category-ranking.service'
import { CategoryRankingTable } from './CategoryRankingTable'
import { CategoryMappingDialog } from './CategoryMappingDialog'
import { DictionaryHeader } from '@/features/dictionary/components/DictionaryHeader'
import { DataTableToolbar } from '@/components/common/DataTableToolbar'
import { PaginationControls } from '@/components/common/PaginationControls'
import type { DictionaryEnvironmentType } from '@/types/dashboard'
import type { CategoryRankingDictionaryListItem } from '@/services/dictionary/category-ranking.service'

export function CategoryRankingDictionaryPage() {
  const [environment, setEnvironment] = useState<DictionaryEnvironmentType>('CURRENT')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [editingItem, setEditingItem] = useState<CategoryRankingDictionaryListItem | null>(null)
  const [isMappingDialogOpen, setIsMappingDialogOpen] = useState(false)
  const { toast } = useToast()
  
  // 카테고리??��?� ?�시�?반영???�으므�?모든 ?�경?�서 ?�집 가??
  const canEdit = true
  
  // Config for DictionaryHeader
  const config = {
    name: '카테고리??��',
    apiPath: '/category-rankings',
    theme: {
      color: 'indigo',
      iconName: 'Layers'
    },
    features: {
      realtimeSync: true
    }
  }

  // ?�이??조회
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['category-ranking', page, pageSize, search, environment],
    queryFn: () => categoryRankingService.getList({
      page,
      size: pageSize,
      search: search || undefined,
      environment
    })
  })
  
  const totalPages = useMemo(() => {
    if (!data || data.totalElements <= 0) return 0
    return Math.ceil(data.totalElements / pageSize)
  }, [data, pageSize])

  // ??�� mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryRankingService.delete(id, environment),
    onSuccess: () => {
      toast({ title: '??�� ?�료', description: '??��????��?�었?�니??' })
      refetch()
      setSelectedItems([])
    },
    onError: (error: any) => {
      toast({ 
        title: '??�� ?�패', 
        description: error.message || '??�� �??�류가 발생?�습?�다.',
        variant: 'destructive'
      })
    }
  })

  // ?�괄 ??��
  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return
    
    if (!confirm(`?�택??${selectedItems.length}�???��????��?�시겠습?�까?`)) {
      return
    }

    try {
      for (const id of selectedItems) {
        await deleteMutation.mutateAsync(id)
      }
    } catch (_error) {
      // 개별 ?�러??mutation?�서 처리
    }
  }

  // ?�시�??�기??
  const syncMutation = useMutation({
    mutationFn: () => categoryRankingService.realtimeSync(environment),
    onSuccess: () => {
      toast({ 
        title: '?�기???�료', 
        description: '변경사??�� ?�시간으�?반영?�었?�니??' 
      })
    },
    onError: (error: any) => {
      toast({ 
        title: '?�기???�패', 
        description: error.message || '?�기??�??�류가 발생?�습?�다.',
        variant: 'destructive'
      })
    }
  })

  // 카테고리 매핑 ?�집
  const handleEditMapping = (item: CategoryRankingDictionaryListItem) => {
    setEditingItem(item)
    setIsMappingDialogOpen(true)
  }

  // ???�워??추�?
  const handleAddNew = () => {
    setEditingItem(null)
    setIsMappingDialogOpen(true)
  }

  // 매핑 ?�????처리
  const handleMappingSaved = () => {
    refetch()
    setIsMappingDialogOpen(false)
    setEditingItem(null)
  }

  // ?�시�?반영
  const handleApplyChanges = () => {
    // ?�재 ?�경?�서???�시�?반영 불�?
    if (environment === 'CURRENT') {
      toast({
        title: '?�시�?반영 불�?',
        description: '?�재 ?�경?�서???�시�?반영???????�습?�다. 개발 ?�는 ?�영 ?�경???�택?�주?�요.',
        variant: 'destructive'
      })
      return
    }

    if (!confirm('변경사??�� ?�시간으�?반영?�시겠습?�까?')) {
      return
    }

    syncMutation.mutate()
  }

  return (
    <div className="p-6 space-y-4">
      {/* ?�더 - 기존 ?�전�??�일??DictionaryHeader ?�용 */}
      <DictionaryHeader
        config={config as any}
        canEdit={canEdit}
        environment={environment}
        selectedCount={selectedItems.length}
        onEnvironmentChange={setEnvironment}
        onAdd={handleAddNew}
        onDeleteSelected={handleDeleteSelected}
        onApplyChanges={handleApplyChanges}
      />

      {/* 검???�바 - 기존 ?�전�??�일??DataTableToolbar ?�용 */}
      <DataTableToolbar
        showSearch
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearch={() => {
          setSearch(searchInput)
          setPage(0)  // 검????�??�이지�??�동
        }}
        totalCount={data?.totalElements || 0}
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageSizeChange={(ps) => { setPageSize(ps); setPage(0) }}
      />

      {/* ?�이�?*/}
      <CategoryRankingTable
        items={data?.content || []}
        loading={isLoading}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        onEdit={handleEditMapping}
        onDelete={(id) => deleteMutation.mutate(id)}
        environment={environment}
      />

      {/* ?�이지?�이??- 기존 ?�전�??�일??PaginationControls ?�용 */}
      {totalPages > 1 && (
        <div className="mt-2">
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            totalCount={data?.totalElements || 0}
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
            totalCount={data?.totalElements || 0}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(ps) => { setPageSize(ps); setPage(0) }}
          />
        </div>
      )}

      {/* 카테고리 매핑 ?�이?�로�?*/}
      <CategoryMappingDialog
        open={isMappingDialogOpen}
        onOpenChange={setIsMappingDialogOpen}
        item={editingItem}
        environment={environment}
        onSaved={handleMappingSaved}
      />
    </div>
  )
}
