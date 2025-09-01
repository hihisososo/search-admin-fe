'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { morphemeAnalysisService } from '@/services'
import type { AnalysisEnvironment, QueryAnalysisResponse } from '@/services/morpheme-analysis/types'
import { useToast } from '@/components/ui/use-toast'
import { BaseTable, type Column } from '@/shared/components/tables/BaseTable'
import { DataTableToolbar } from '@/shared/components/DataTableToolbar'
import { PaginationControls } from '@/shared/components/PaginationControls'
import { MorphemeAnalysisHeader } from './MorphemeAnalysisHeader'

interface AnalysisRecord {
  id: string
  query: string
  environment: AnalysisEnvironment
  timestamp: Date
  result: QueryAnalysisResponse
}

export function MorphemeAnalysisPage() {
  const [environment, setEnvironment] = useState<AnalysisEnvironment>('CURRENT')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [analysisRecords, setAnalysisRecords] = useState<AnalysisRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  
  // 페이지네이션
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  
  // 페이지네이션된 데이터
  const paginatedRecords = useMemo(() => {
    const start = page * pageSize
    const end = start + pageSize
    return analysisRecords.slice(start, end)
  }, [analysisRecords, page, pageSize])
  
  const totalPages = useMemo(() => {
    if (analysisRecords.length === 0) return 0
    return Math.ceil(analysisRecords.length / pageSize)
  }, [analysisRecords.length, pageSize])

  const handleAnalyze = async () => {
    const queryToAnalyze = searchInput.trim()
    if (!queryToAnalyze) {
      toast({
        title: '오류',
        description: '분석할 쿼리를 입력해주세요.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const result = await morphemeAnalysisService.analyzeQuery({
        query: queryToAnalyze,
        environment
      })
      
      // 분석 기록 추가
      const newRecord: AnalysisRecord = {
        id: Date.now().toString(),
        query: queryToAnalyze,
        environment,
        timestamp: new Date(),
        result
      }
      
      setAnalysisRecords(prev => [newRecord, ...prev])
      setSearchInput('') // 검색 입력 초기화
      setPage(0) // 첫 페이지로 이동
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '쿼리 분석 중 오류가 발생했습니다.'
      setError(errorMessage)
      toast({
        title: '분석 실패',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshIndex = async () => {
    setRefreshing(true)
    
    try {
      const result = await morphemeAnalysisService.refreshTempIndex()
      toast({
        title: '인덱스 갱신 완료',
        description: result.message || '임시 인덱스가 성공적으로 갱신되었습니다.'
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '임시 인덱스 갱신 중 오류가 발생했습니다.'
      toast({
        title: '갱신 실패',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setRefreshing(false)
    }
  }

  const handleClearRecords = () => {
    setAnalysisRecords([])
    setPage(0)
  }

  // 테이블 컬럼 정의
  const columns: Column<AnalysisRecord>[] = [
    {
      key: 'query',
      label: '쿼리',
      width: 'w-[200px]',
      render: (item) => (
        <span className="font-mono text-sm">{item.query}</span>
      )
    },
    {
      key: 'environment',
      label: '환경',
      width: 'w-[80px]',
      align: 'center',
      render: (item) => (
        <Badge variant="outline" className="text-xs">
          {item.environment}
        </Badge>
      )
    },
    {
      key: 'tokens',
      label: '토큰',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.result.noriAnalysis.tokens.map((token, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {token.token}
            </Badge>
          ))}
        </div>
      )
    },
    {
      key: 'synonyms',
      label: '동의어 경로',
      render: (item) => {
        const paths = item.result.noriAnalysis.synonymPaths
        return (
          <div className="space-y-1">
            {paths && paths.length > 0 ? (
              paths.slice(0, 3).map((path, idx) => (
                <div key={idx} className="text-xs text-gray-600">
                  {path}
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-400">없음</span>
            )}
            {paths && paths.length > 3 && (
              <span className="text-xs text-gray-400">... 외 {paths.length - 3}개</span>
            )}
          </div>
        )
      }
    },
    {
      key: 'units',
      label: '단위',
      render: (item) => (
        <div className="space-y-1">
          {item.result.units.map((unit, idx) => (
            <div key={idx} className="flex items-center gap-1 flex-wrap">
              <span className="text-xs font-medium">{unit.original}:</span>
              {unit.expanded.map((exp, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {exp}
                </Badge>
              ))}
            </div>
          ))}
          {item.result.units.length === 0 && (
            <span className="text-xs text-gray-400">없음</span>
          )}
        </div>
      )
    },
    {
      key: 'models',
      label: '모델명',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.result.models.map((model, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {model}
            </Badge>
          ))}
          {item.result.models.length === 0 && (
            <span className="text-xs text-gray-400">없음</span>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="p-6 space-y-4">
      {/* 헤더 */}
      <MorphemeAnalysisHeader
        environment={environment}
        onEnvironmentChange={setEnvironment}
        onRefreshIndex={handleRefreshIndex}
        refreshing={refreshing}
        recordCount={analysisRecords.length}
        onClearRecords={handleClearRecords}
      />

      {/* 검색 툴바 */}
      <DataTableToolbar
        showSearch
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearch={handleAnalyze}
        searchPlaceholder="분석할 검색어를 입력하세요 (예: 삼성전자 노트북 1kg)"
        totalCount={analysisRecords.length}
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageSizeChange={(ps) => { setPageSize(ps); setPage(0) }}
        disabled={loading}
      />

      {/* 에러 메시지 */}
      {error && (
        <div className="text-red-600 text-sm p-3 bg-red-50 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* 분석 기록 테이블 */}
      <BaseTable
        columns={columns}
        data={paginatedRecords}
        loading={loading}
        emptyMessage="분석 기록이 없습니다."
        keyExtractor={(item) => item.id}
        className="bg-white"
      />

      {/* 페이지네이션 */}
      {totalPages > 0 && (
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          totalCount={analysisRecords.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(ps) => { setPageSize(ps); setPage(0) }}
        />
      )}
    </div>
  )
}