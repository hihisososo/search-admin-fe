import { useQuery } from '@tanstack/react-query'
import { synonymDictionaryService, typoCorrectionDictionaryService, stopwordDictionaryService, userDictionaryService } from '@/services'
import { queryKeys } from '@/lib/query-client'
import { getDictionaryConfig } from '../configs/dictionaryConfigs'
import type { DictionaryType, BaseDictionaryItem } from '../types/dictionary.types'
import type { DictionaryEnvironmentType, DictionarySortField, DictionarySortDirection } from '@/types/dashboard'

interface UseDictionaryDataParams {
  type: DictionaryType
  page: number
  pageSize: number
  search: string
  sortField: DictionarySortField
  sortDirection: DictionarySortDirection
  environment: DictionaryEnvironmentType
}

export function useDictionaryData<T extends BaseDictionaryItem>({
  type,
  page,
  pageSize,
  search,
  sortField,
  sortDirection,
  environment
}: UseDictionaryDataParams) {
  
  const paramsForKey = {
    page: page - 1,
    size: pageSize,
    sortBy: sortField,
    sortDir: sortDirection,
    search: search || undefined,
    environment
  }

  const queryKey = (
    type === 'user' ? queryKeys.dictionary.user.list(paramsForKey) :
    type === 'stopword' ? queryKeys.dictionary.stopword.list(paramsForKey) :
    type === 'synonym' ? queryKeys.dictionary.synonym.list(paramsForKey) :
    queryKeys.dictionary.typoCorrection.list(paramsForKey)
  )
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = {
        page: page - 1,
        size: pageSize,
        sortBy: sortField,
        sortDir: sortDirection,
        search: search || undefined,
        environment,
      } as const

      const service =
        type === 'user' ? userDictionaryService :
        type === 'stopword' ? stopwordDictionaryService :
        type === 'synonym' ? synonymDictionaryService :
        typoCorrectionDictionaryService

      return (await service.getList(params as any)) as unknown as {
        content: T[]
        totalElements: number
        totalPages: number
      }
    },
    retry: 1,
    staleTime: 30000,
  })
}