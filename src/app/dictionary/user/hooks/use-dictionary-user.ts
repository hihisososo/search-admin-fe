import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
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

export function useDictionaryUser({
  page,
  search,
  sortField,
  sortDirection,
  environment,
}: UseDictionaryUserParams): UseDictionaryUserReturn {
  const [data, setData] = useState<DictionaryPageResponse<DictionaryItem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchItems = async () => {
    setLoading(true)
    setError('')
    
    try {
      const params = new URLSearchParams({
        page: (page - 1).toString(),
        size: '20',
        sortBy: sortField,
        sortDir: sortDirection,
        environment: environment,
        ...(search && { search }),
      })
      
      const response = await apiFetch<DictionaryPageResponse<DictionaryItem>>(
        `/v1/dictionaries/user?${params}`
      )
      
      setData(response)
    } catch (err) {
      console.error('사용자 사전 API 에러:', err)
      
      if (err instanceof Error) {
        if (err.message.includes('500') || err.message.includes('서버 내부 오류')) {
          setError('서버에서 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        } else {
          setError(err.message)
        }
      } else {
        setError('목록 조회 중 오류가 발생했습니다.')
      }
      
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortField, sortDirection, environment, search])

  return {
    data,
    loading,
    error,
    refetch: fetchItems,
  }
}