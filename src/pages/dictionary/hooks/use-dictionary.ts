import { useDictionaryData } from '@/pages/dictionary/common/hooks/useDictionaryData'
import type {
  DictionaryItem,
  DictionarySortField,
  DictionarySortDirection,
  DictionaryPageResponse
} from '@/services/dictionary/types'
import { Environment as DictionaryEnvironmentType } from '@/services/common/types'
import type { TypoCorrectionDictionaryItem } from '@/services/dictionary/types'
import type { DictionaryType } from '@/pages/dictionary/common/types/dictionary.types'

interface UseDictionaryParams {
  type: DictionaryType
  page: number
  search: string
  sortField: DictionarySortField
  sortDirection: DictionarySortDirection
  environment: DictionaryEnvironmentType
}

interface UseDictionaryConfig {
  pageOffset?: number
  returnFullData?: boolean
}

const DICTIONARY_CONFIGS: Record<DictionaryType, UseDictionaryConfig> = {
  synonym: {},
  typo: { pageOffset: -1 },
  user: { returnFullData: true },
  stopword: {},
  unit: {}
}

export function useDictionary<T extends DictionaryItem | TypoCorrectionDictionaryItem>(
  params: UseDictionaryParams
) {
  const config = DICTIONARY_CONFIGS[params.type] || {}
  const adjustedPage = params.page + (config.pageOffset || 0)

  const { data, isLoading, error, refetch } = useDictionaryData<T>({
    type: params.type,
    page: adjustedPage,
    pageSize: 20,
    search: params.search,
    sortField: params.sortField,
    sortDirection: params.sortDirection,
    environment: params.environment
  })

  if (config.returnFullData) {
    return {
      data: data as DictionaryPageResponse<T> | null,
      loading: isLoading,
      error: error?.message || '',
      refetch: async () => {
        await refetch()
      }
    }
  }

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