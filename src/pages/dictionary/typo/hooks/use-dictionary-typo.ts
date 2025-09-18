import { useDictionary } from '@/pages/dictionary/hooks/use-dictionary'
import { Environment as DictionaryEnvironmentType } from '@/services/common/types'
import type { DictionarySortField, DictionarySortDirection } from '@/services/dictionary/types'
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