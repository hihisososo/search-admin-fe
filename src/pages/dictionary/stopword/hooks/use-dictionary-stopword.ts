import { useDictionaryData } from '@/pages/dictionary/common/hooks/useDictionaryData'
import type {
  DictionaryItem,
  DictionarySortField,
  DictionarySortDirection
} from '@/services/dictionary/types'
import { Environment as DictionaryEnvironmentType } from '@/services/common/types'

interface UseDictionaryStopwordParams {
  page: number
  search: string
  sortField: DictionarySortField
  sortDirection: DictionarySortDirection
  environment: DictionaryEnvironmentType
}

export function useDictionaryStopword(params: UseDictionaryStopwordParams) {
  return useDictionaryData<DictionaryItem>({
    type: 'stopword',
    page: params.page,
    pageSize: 20,
    search: params.search,
    sortField: params.sortField,
    sortDirection: params.sortDirection,
    environment: params.environment
  })
}