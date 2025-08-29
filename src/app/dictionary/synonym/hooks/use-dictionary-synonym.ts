import { useDictionary } from '@/app/dictionary/hooks/use-dictionary'
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
  return useDictionary<DictionaryItem>({
    type: 'synonym',
    ...params
  })
}