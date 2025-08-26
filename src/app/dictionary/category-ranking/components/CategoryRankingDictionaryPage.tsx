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
  
  // 카테고리랭킹은 실시간 반영이 있으므로 모든 환경에서 편집 가능
  const canEdit = true
  
  // Config for DictionaryHeader
  const config = {
    name: '카테고리랭킹',
    apiPath: '/category-rankings',
    theme: {
      color: 'indigo',
      iconName: 'Layers'
    },
    features: {
      realtimeSync: true
    }
  }

  // 데이터 조회
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

  // 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryRankingService.delete(id, environment),
    onSuccess: () => {
      toast({ title: '삭제 완료', description: '항목이 삭제되었습니다.' })
      refetch()
      setSelectedItems([])
    },
    onError: (error: any) => {
      toast({ 
        title: '삭제 실패', 
        description: error.message || '삭제 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
    }
  })

  // 일괄 삭제
  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return
    
    if (!confirm(`선택한 ${selectedItems.length}개 항목을 삭제하시겠습니까?`)) {
      return
    }

    try {
      for (const id of selectedItems) {
        await deleteMutation.mutateAsync(id)
      }
    } catch (_error) {
      // 개별 에러는 mutation에서 처리
    }
  }

  // 실시간 동기화
  const syncMutation = useMutation({
    mutationFn: () => categoryRankingService.realtimeSync(environment),
    onSuccess: () => {
      toast({ 
        title: '동기화 완료', 
        description: '변경사항이 실시간으로 반영되었습니다.' 
      })
    },
    onError: (error: any) => {
      toast({ 
        title: '동기화 실패', 
        description: error.message || '동기화 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
    }
  })

  // 카테고리 매핑 편집
  const handleEditMapping = (item: CategoryRankingDictionaryListItem) => {
    setEditingItem(item)
    setIsMappingDialogOpen(true)
  }

  // 새 키워드 추가
  const handleAddNew = () => {
    setEditingItem(null)
    setIsMappingDialogOpen(true)
  }

  // 매핑 저장 후 처리
  const handleMappingSaved = () => {
    refetch()
    setIsMappingDialogOpen(false)
    setEditingItem(null)
  }

  // 실시간 반영
  const handleApplyChanges = () => {
    // 현재 환경에서는 실시간 반영 불가
    if (environment === 'CURRENT') {
      toast({
        title: '실시간 반영 불가',
        description: '현재 환경에서는 실시간 반영을 할 수 없습니다. 개발 또는 운영 환경을 선택해주세요.',
        variant: 'destructive'
      })
      return
    }

    if (!confirm('변경사항을 실시간으로 반영하시겠습니까?')) {
      return
    }

    syncMutation.mutate()
  }

  return (
    <div className="p-6 space-y-4">
      {/* 헤더 - 기존 사전과 동일한 DictionaryHeader 사용 */}
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

      {/* 검색 툴바 - 기존 사전과 동일한 DataTableToolbar 사용 */}
      <DataTableToolbar
        showSearch
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearch={() => setSearch(searchInput)}
        totalCount={data?.totalElements || 0}
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageSizeChange={(ps) => { setPageSize(ps); setPage(0) }}
      />

      {/* 테이블 */}
      <CategoryRankingTable
        items={data?.content || []}
        loading={isLoading}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        onEdit={handleEditMapping}
        onDelete={(id) => deleteMutation.mutate(id)}
        environment={environment}
      />

      {/* 페이지네이션 - 기존 사전과 동일한 PaginationControls 사용 */}
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

      {/* 카테고리 매핑 다이얼로그 */}
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