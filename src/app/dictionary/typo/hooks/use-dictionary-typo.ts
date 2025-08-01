import { useState, useEffect, useCallback } from 'react'
import { typoCorrectionDictionaryApi } from '@/lib/api'
import type { DictionarySortField, DictionarySortDirection, DictionaryEnvironmentType } from '@/types/dashboard'
import type { TypoCorrectionDictionaryItem } from '@/services/dictionary/types'

interface UseDictionaryTypoParams {
  page: number
  search: string
  sortField: DictionarySortField
  sortDirection: DictionarySortDirection
  environment: DictionaryEnvironmentType
}

interface UseDictionaryTypoReturn {
  data: TypoCorrectionDictionaryItem[]
  loading: boolean
  error: string
  total: number
  refetch: () => Promise<void>
}

export function useDictionaryTypo({
  page,
  search,
  sortField,
  sortDirection,
  environment
}: UseDictionaryTypoParams): UseDictionaryTypoReturn {
  const [data, setData] = useState<TypoCorrectionDictionaryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: page - 1,
        size: 20,
        sortBy: sortField,
        sortDir: sortDirection,
        environment: environment,
        ...(search && { search })
      }
      
      const response = await typoCorrectionDictionaryApi.getList(params)
      
      setData(response.content || [])
      setTotal(response.totalElements || 0)
    } catch (err) {
      console.error('오타교정 사전 API 에러:', err)
      if (err instanceof Error) {
        if (err.message.includes('500') || err.message.includes('서버 내부 오류')) {
          setError('서버에서 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        } else {
          setError(err.message)
        }
      } else {
        setError('목록 조회 중 오류가 발생했습니다.')
      }
      setData([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, search, sortField, sortDirection, environment])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    total,
    refetch: fetchData
  }
}