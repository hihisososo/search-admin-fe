import { useDictionaryData } from '@/features/dictionary/hooks/useDictionaryData'
import type { 
  DictionaryItem, 
  DictionarySortField, 
  DictionarySortDirection,
  DictionaryEnvironmentType 
} from '@/types/dashboard'

interface UseDictionarySynonymParams {
  page: number
  search: string
  sortField: DictionarySortField
  sortDirection: DictionarySortDirection
  environment: DictionaryEnvironmentType
}

export function useDictionarySynonym(params: UseDictionarySynonymParams) {
  const { data, isLoading, error, refetch } = useDictionaryData<DictionaryItem>({
    type: 'synonym',
    page: params.page,
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