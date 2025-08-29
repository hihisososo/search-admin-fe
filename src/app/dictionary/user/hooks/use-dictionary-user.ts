import { useDictionary } from '@/app/dictionary/hooks/use-dictionary'
import type {
  DictionaryItem,
  DictionaryPageResponse,
  DictionarySortField,
  DictionarySortDirection,
  DictionaryEnvironmentType,
} from '@/types/dashboard'

interface UseDictionaryUserParams {
  page: number
  search: string
  sortField: DictionarySortField
  sortDirection: DictionarySortDirection
  environment: DictionaryEnvironmentType
}

interface UseDictionaryUserReturn {
  data: DictionaryPageResponse<DictionaryItem> | null
  loading: boolean
  error: string
  refetch: () => Promise<void>
}

export function useDictionaryUser(params: UseDictionaryUserParams): UseDictionaryUserReturn {
  return useDictionary<DictionaryItem>({
    type: 'user',
    ...params
  }) as UseDictionaryUserReturn
}