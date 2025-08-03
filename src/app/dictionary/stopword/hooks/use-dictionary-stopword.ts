import { useDictionaryData } from '@/hooks/dictionary'
import { stopwordDictionaryApi } from '@/lib/api'
import type { 
  DictionaryItem, 
  DictionarySortField, 
  DictionarySortDirection,
  DictionaryEnvironmentType 
} from '@/types/dashboard'

interface UseDictionaryStopwordParams {
  page: number
  search: string
  sortField: DictionarySortField
  sortDirection: DictionarySortDirection
  environment: DictionaryEnvironmentType
}

export function useDictionaryStopword(params: UseDictionaryStopwordParams) {
  return useDictionaryData<DictionaryItem>(params, {
    queryKey: 'stopword-dictionary',
    fetchFn: stopwordDictionaryApi.getList,
    pageSize: 20
  })
}