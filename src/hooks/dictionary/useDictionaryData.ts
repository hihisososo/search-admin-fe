import { useQuery } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import type { DictionaryEnvironmentType, DictionarySortField, DictionarySortDirection } from "@/types/dashboard"
import { logger } from "@/lib/logger"

interface UseDictionaryDataParams {
  page: number
  search: string
  sortField: DictionarySortField
  sortDirection: DictionarySortDirection
  environment: DictionaryEnvironmentType
}

interface UseDictionaryDataOptions<T> {
  queryKey: string
  fetchFn: (params: {
    page: number
    size: number
    sort: string
    search?: string
    environment: DictionaryEnvironmentType
  }) => Promise<{ content: T[]; totalElements: number }>
  pageSize: number
}

export function useDictionaryData<T>({
  page,
  search,
  sortField,
  sortDirection,
  environment
}: UseDictionaryDataParams, options: UseDictionaryDataOptions<T>) {
  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const params = {
    page: page - 1,
    size: options.pageSize,
    sort: `${sortField},${sortDirection}`,
    search: search || undefined,
    environment
  }

  const query = useQuery({
    queryKey: [options.queryKey, params],
    queryFn: async () => {
      try {
        const response = await options.fetchFn(params)
        return response
      } catch (error) {
        logger.error("Dictionary fetch error", error as Error)
        throw error
      }
    },
    retry: 1
  })

  useEffect(() => {
    if (query.error) {
      const error = query.error as Error
      if (error.message.includes("500")) {
        setError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
      } else {
        setError(error.message || "데이터를 불러오는 중 오류가 발생했습니다.")
      }
      setData([])
      setTotal(0)
    } else if (query.data) {
      setData(query.data.content)
      setTotal(query.data.totalElements)
      setError(null)
    }
  }, [query.data, query.error])

  return {
    data,
    loading: query.isLoading,
    error,
    total,
    refetch: query.refetch
  }
}