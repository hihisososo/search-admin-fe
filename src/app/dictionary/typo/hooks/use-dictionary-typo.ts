import { useDictionaryData } from '@/features/dictionary/hooks/useDictionaryData'
import type { DictionarySortField, DictionarySortDirection, DictionaryEnvironmentType } from '@/types/dashboard'
import type { TypoCorrectionDictionaryItem } from '@/services/dictionary/types'

interface UseDictionaryTypoParams {
  page: number
  search: string
  sortField: DictionarySortField
  sortDirection: DictionarySortDirection
  environment: DictionaryEnvironmentType
}

export function useDictionaryTypo(params: UseDictionaryTypoParams) {
  const { data, isLoading, error, refetch } = useDictionaryData<TypoCorrectionDictionaryItem>({
    type: 'typo',
    page: params.page - 1, // 기존 로직 유지: page - 1
    pageSize: 20,
    search: params.search,
    sortField: params.sortField,
    sortDirection: params.sortDirection,
    environment: params.environment
  })

  return {
    data: data?.content || [],
    loading: isLoading,
    error: error?.message || '',
    total: data?.totalElements || 0,
    refetch: async () => {
      await refetch()
    }
  }
}