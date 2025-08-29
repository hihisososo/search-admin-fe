import { useDictionary } from '@/app/dictionary/hooks/use-dictionary'
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
  return useDictionary<TypoCorrectionDictionaryItem>({
    type: 'typo',
    ...params
  })
}