import { useDictionary } from '@/pages/dictionary/hooks/use-dictionary'
import type {
  DictionaryItem,
  DictionarySortField,
  DictionarySortDirection
} from '@/services/dictionary/types'
import { Environment as DictionaryEnvironmentType } from '@/services/common/types'

interface UseDictionarySynonymParams {
  page: number
  search: string
  sortField: DictionarySortField
  sortDirection: DictionarySortDirection
  environment: DictionaryEnvironmentType
}

export function useDictionarySynonym(params: UseDictionarySynonymParams) {
  return useDictionary<DictionaryItem>({
    type: 'synonym',
    ...params
  })
}