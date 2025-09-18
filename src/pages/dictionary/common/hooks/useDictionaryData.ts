import { useQuery } from '@tanstack/react-query'
import { synonymDictionaryService, typoCorrectionDictionaryService, stopwordDictionaryService, userDictionaryService, unitDictionaryService } from '@/services'
import { queryKeys } from '@/lib/query-client'
import type { DictionaryType, BaseDictionaryItem } from '../types/dictionary.types'
import { Environment as DictionaryEnvironmentType } from '@/services/common/types'
import type { DictionarySortField, DictionarySortDirection } from '@/services/dictionary/types'

interface UseDictionaryDataParams {
  type: DictionaryType
  page: number
  pageSize: number
  search: string
  sortField: DictionarySortField
  sortDirection: DictionarySortDirection
  environment: DictionaryEnvironmentType
}

const DICTIONARY_CONFIG = {
  user: {
    queryKey: queryKeys.dictionary.user.list,
    service: userDictionaryService
  },
  stopword: {
    queryKey: queryKeys.dictionary.stopword.list,
    service: stopwordDictionaryService
  },
  synonym: {
    queryKey: queryKeys.dictionary.synonym.list,
    service: synonymDictionaryService
  },
  typo: {
    queryKey: queryKeys.dictionary.typoCorrection.list,
    service: typoCorrectionDictionaryService
  },
  unit: {
    queryKey: queryKeys.dictionary.unit.list,
    service: unitDictionaryService
  }
} as const

export function useDictionaryData<_T extends BaseDictionaryItem>({
  type,
  page,
  pageSize,
  search,
  sortField,
  sortDirection,
  environment
}: UseDictionaryDataParams) {
  
  const params = {
    page,
    size: pageSize,
    sort: `${sortField},${sortDirection}`,
    search: search || undefined,
    environment
  }

  const config = DICTIONARY_CONFIG[type]
  
  return useQuery({
    queryKey: config.queryKey(params),
    queryFn: async () => {
      const response = await config.service.getList(params as any)
      return response
    },
    retry: 1,
    staleTime: 30000,
  })
}