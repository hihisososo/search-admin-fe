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
  
  // ì¹´í…Œê³ ë¦¬??‚¹?€ ?¤ì‹œê°?ë°˜ì˜???ˆìœ¼ë¯€ë¡?ëª¨ë“  ?˜ê²½?ì„œ ?¸ì§‘ ê°€??
  const canEdit = true
  
  // Config for DictionaryHeader
  const config = {
    name: 'ì¹´í…Œê³ ë¦¬??‚¹',
    apiPath: '/category-rankings',
    theme: {
      color: 'indigo',
      iconName: 'Layers'
    },
    features: {
      realtimeSync: true
    }
  }

  // ?°ì´??ì¡°íšŒ
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

  // ?? œ mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryRankingService.delete(id, environment),
    onSuccess: () => {
      toast({ title: '?? œ ?„ë£Œ', description: '??ª©???? œ?˜ì—ˆ?µë‹ˆ??' })
      refetch()
      setSelectedItems([])
    },
    onError: (error: any) => {
      toast({ 
        title: '?? œ ?¤íŒ¨', 
        description: error.message || '?? œ ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.',
        variant: 'destructive'
      })
    }
  })

  // ?¼ê´„ ?? œ
  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return
    
    if (!confirm(`? íƒ??${selectedItems.length}ê°???ª©???? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?`)) {
      return
    }

    try {
      for (const id of selectedItems) {
        await deleteMutation.mutateAsync(id)
      }
    } catch (_error) {
      // ê°œë³„ ?ëŸ¬??mutation?ì„œ ì²˜ë¦¬
    }
  }

  // ?¤ì‹œê°??™ê¸°??
  const syncMutation = useMutation({
    mutationFn: () => categoryRankingService.realtimeSync(environment),
    onSuccess: () => {
      toast({ 
        title: '?™ê¸°???„ë£Œ', 
        description: 'ë³€ê²½ì‚¬??´ ?¤ì‹œê°„ìœ¼ë¡?ë°˜ì˜?˜ì—ˆ?µë‹ˆ??' 
      })
    },
    onError: (error: any) => {
      toast({ 
        title: '?™ê¸°???¤íŒ¨', 
        description: error.message || '?™ê¸°??ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.',
        variant: 'destructive'
      })
    }
  })

  // ì¹´í…Œê³ ë¦¬ ë§¤í•‘ ?¸ì§‘
  const handleEditMapping = (item: CategoryRankingDictionaryListItem) => {
    setEditingItem(item)
    setIsMappingDialogOpen(true)
  }

  // ???¤ì›Œ??ì¶”ê?
  const handleAddNew = () => {
    setEditingItem(null)
    setIsMappingDialogOpen(true)
  }

  // ë§¤í•‘ ?€????ì²˜ë¦¬
  const handleMappingSaved = () => {
    refetch()
    setIsMappingDialogOpen(false)
    setEditingItem(null)
  }

  // ?¤ì‹œê°?ë°˜ì˜
  const handleApplyChanges = () => {
    // ?„ì¬ ?˜ê²½?ì„œ???¤ì‹œê°?ë°˜ì˜ ë¶ˆê?
    if (environment === 'CURRENT') {
      toast({
        title: '?¤ì‹œê°?ë°˜ì˜ ë¶ˆê?',
        description: '?„ì¬ ?˜ê²½?ì„œ???¤ì‹œê°?ë°˜ì˜???????†ìŠµ?ˆë‹¤. ê°œë°œ ?ëŠ” ?´ì˜ ?˜ê²½??? íƒ?´ì£¼?¸ìš”.',
        variant: 'destructive'
      })
      return
    }

    if (!confirm('ë³€ê²½ì‚¬??„ ?¤ì‹œê°„ìœ¼ë¡?ë°˜ì˜?˜ì‹œê² ìŠµ?ˆê¹Œ?')) {
      return
    }

    syncMutation.mutate()
  }

  return (
    <div className="p-6 space-y-4">
      {/* ?¤ë” - ê¸°ì¡´ ?¬ì „ê³??™ì¼??DictionaryHeader ?¬ìš© */}
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

      {/* ê²€???´ë°” - ê¸°ì¡´ ?¬ì „ê³??™ì¼??DataTableToolbar ?¬ìš© */}
      <DataTableToolbar
        showSearch
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearch={() => {
          setSearch(searchInput)
          setPage(0)  // ê²€????ì²??˜ì´ì§€ë¡??´ë™
        }}
        totalCount={data?.totalElements || 0}
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageSizeChange={(ps) => { setPageSize(ps); setPage(0) }}
      />

      {/* ?Œì´ë¸?*/}
      <CategoryRankingTable
        items={data?.content || []}
        loading={isLoading}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        onEdit={handleEditMapping}
        onDelete={(id) => deleteMutation.mutate(id)}
        environment={environment}
      />

      {/* ?˜ì´ì§€?¤ì´??- ê¸°ì¡´ ?¬ì „ê³??™ì¼??PaginationControls ?¬ìš© */}
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

      {/* ì¹´í…Œê³ ë¦¬ ë§¤í•‘ ?¤ì´?¼ë¡œê·?*/}
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
