import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
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
  const config = getDictionaryConfig(type)
  
  const queryKey = [
    'dictionary',
    type,
    {
      page: page - 1,
      size: pageSize,
      sort: `${sortField},${sortDirection}`,
      search: search || undefined,
      environment
    }
  ]
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page - 1),
        size: String(pageSize),
        sort: `${sortField},${sortDirection}`,
        environment
      })
      
      if (search) {
        params.append('search', search)
      }
      
      const response = await apiClient.get<{
        content: T[]
        totalElements: number
        totalPages: number
      }>(`/v1/dictionaries${config.apiPath}?${params}`)
      
      return response
    },
    retry: 1,
    staleTime: 30000,
  })
}