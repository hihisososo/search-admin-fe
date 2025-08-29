import { useDictionaryData } from '@/features/dictionary/hooks/useDictionaryData'
import type {
  DictionaryItem,
  DictionaryPageResponse,
  DictionarySortField,
  DictionarySortDirection,
  DictionaryEnvironmentType,
} from '@/types/dashboard'

interface UseDictionaryUserParams {
  page: number
  search: string
  sortField: DictionarySortField
  sortDirection: DictionarySortDirection
  environment: DictionaryEnvironmentType
}

interface UseDictionaryUserReturn {
  data: DictionaryPageResponse<DictionaryItem> | null
  loading: boolean
  error: string
  refetch: () => Promise<void>
}

export function useDictionaryUser(params: UseDictionaryUserParams): UseDictionaryUserReturn {
  const { data, isLoading, error, refetch } = useDictionaryData<DictionaryItem>({
    type: 'user',
    page: params.page,
    pageSize: 20,
    search: params.search,
    sortField: params.sortField,
    sortDirection: params.sortDirection,
    environment: params.environment
  })

  return {
    data: data || null,
    loading: isLoading,
    error: error?.message || '',
    refetch: async () => {
      await refetch()
    }
  }
}