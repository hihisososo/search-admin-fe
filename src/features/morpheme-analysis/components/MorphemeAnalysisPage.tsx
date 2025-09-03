'use client'

import { useState, useEffect, useRef } from 'react'
import { morphemeAnalysisService } from '@/services'
import type { AnalysisEnvironment, QueryAnalysisResponse, IndexAnalysisResponse } from '@/services/morpheme-analysis/types'
import { useToast } from '@/components/ui/use-toast'
import { MorphemeAnalysisHeader } from './MorphemeAnalysisHeader'
import { Search } from 'lucide-react'
import mermaid from 'mermaid'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

export function MorphemeAnalysisPage() {
  const [environment, setEnvironment] = useState<AnalysisEnvironment>('CURRENT')
  const [analysisType, setAnalysisType] = useState<'search' | 'index'>('search')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<QueryAnalysisResponse | IndexAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const graphRef = useRef<HTMLDivElement>(null)

  const handleAnalyze = async () => {
    const queryToAnalyze = searchInput.trim()
    if (!queryToAnalyze) {
      toast({
        title: '검색어를 입력해주세요',
        description: '분석할 검색어가 필요합니다.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    setError(null)
    setAnalysisResult(null)

    try {
      let response
      if (analysisType === 'search') {
        response = await morphemeAnalysisService.analyzeQuery({
          query: queryToAnalyze,
          environment
        })
      } else {
        response = await morphemeAnalysisService.analyzeIndexQuery({
          query: queryToAnalyze,
          environment
        })
      }
      
      setAnalysisResult(response)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.'
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

  const handleRefresh = async () => {
    if (environment !== 'CURRENT') {
      toast({
        title: '갱신 불가',
        description: 'CURRENT 환경에서만 임시 인덱스를 갱신할 수 있습니다.',
        variant: 'destructive'
      })
      return
    }

    setRefreshing(true)
    try {
      const result = await morphemeAnalysisService.refreshTempIndex()
      
      toast({
        title: '갱신 완료',
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

  // Mermaid 그래프 렌더링
  useEffect(() => {
    if (!analysisResult || !('mermaidGraph' in analysisResult) || !analysisResult.mermaidGraph || !graphRef.current) return

    // 실제 노드가 있는지 확인 (classDef만 있고 노드가 없는 빈 그래프 체크)
    const hasNodes = analysisResult.mermaidGraph.includes('-->') || 
                     analysisResult.mermaidGraph.includes('==>') ||
                     analysisResult.mermaidGraph.includes('---')
    
    if (!hasNodes) {
      graphRef.current!.innerHTML = '<div class="text-gray-400 text-sm">동의어 확장 결과가 없습니다</div>'
      return
    }

    const renderGraph = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          flowchart: {
            htmlLabels: true,
            curve: 'linear',
            nodeSpacing: 50,
            rankSpacing: 80
          }
        })

        // 기존 내용 제거
        graphRef.current!.innerHTML = ''

        // 고유 ID 생성
        const id = `mermaid-${Date.now()}`

        // JSON escape 처리 해제 및 화살표 문법 수정
        const unescapedGraph = analysisResult.mermaidGraph
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\')
          .replace(/===([^=]+)===>/g, '==>|$1|')
        
        // 그래프 렌더링
        const { svg } = await mermaid.render(id, unescapedGraph)
        
        if (graphRef.current && svg) {
          graphRef.current.innerHTML = svg
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err)
      }
    }

    // DOM이 준비될 때까지 대기
    setTimeout(renderGraph, 100)
  }, [analysisResult])

  return (
    <div className="p-6 space-y-4">
      {/* 헤더 */}
      <MorphemeAnalysisHeader 
        environment={environment}
        onEnvironmentChange={setEnvironment}
        onRefreshIndex={handleRefresh}
        refreshing={refreshing}
        recordCount={0}
        onClearRecords={() => setAnalysisResult(null)}
      />

      {/* 검색 입력 */}
      <div className="flex items-center gap-2">
        <Select value={analysisType} onValueChange={(value: 'search' | 'index') => setAnalysisType(value)}>
          <SelectTrigger className="w-28 text-xs h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="search" className="text-xs">검색용</SelectItem>
            <SelectItem value="index" className="text-xs">색인용</SelectItem>
          </SelectContent>
        </Select>
        
        <Input
          placeholder="분석할 검색어를 입력하세요 (예: 삼성전자 노트북 1kg)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          className="max-w-md text-sm"
          disabled={loading}
        />
        
        <Button 
          onClick={handleAnalyze} 
          disabled={loading} 
          size="icon" 
          variant="outline" 
          className="w-9" 
          aria-label="검색"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="text-red-600 text-sm p-3 bg-red-50 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* 분석 결과 */}
      {analysisResult && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs text-gray-500">원본:</span>
                <span className="font-mono text-sm text-gray-900 ml-2">{analysisResult.originalQuery}</span>
              </div>
            </div>

            {/* 토큰 목록 */}
            <div className="pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs text-gray-500">분석된 토큰:</span>
                <span className="text-sm text-gray-900 ml-2">
                  {analysisResult.tokens.length > 0 ? analysisResult.tokens.join(', ') : '없음'}
                </span>
              </div>
            </div>

            {/* 검색용 분석: 검색식 */}
            {'queryExpression' in analysisResult && (
              <div className="pb-4 border-b border-gray-100">
                <div>
                  <span className="text-xs text-gray-500">검색식:</span>
                  <span className="text-sm font-mono text-gray-900 ml-2">
                    {analysisResult.queryExpression || '없음'}
                  </span>
                </div>
              </div>
            )}

            {/* 색인용 분석: 추가 색인어 */}
            {'additionalTokens' in analysisResult && (
              <div className="pb-4 border-b border-gray-100">
                <div>
                  <span className="text-xs text-gray-500">추가 색인어:</span>
                  <span className="text-sm text-gray-900 ml-2">
                    {analysisResult.additionalTokens.length > 0 
                      ? analysisResult.additionalTokens.join(', ')
                      : '없음'}
                  </span>
                </div>
              </div>
            )}

            {/* Mermaid 그래프 (검색용만) */}
            {'mermaidGraph' in analysisResult && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">동의어 확장 결과</h4>
                <div className="border rounded-lg p-6 bg-gray-50">
                  <div ref={graphRef} className="flex justify-center" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 초기 상태 */}
      {!loading && !analysisResult && !error && (
        <div className="bg-white border border-gray-200 rounded-lg p-12">
          <div className="text-center text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">검색어를 입력하여 형태소 분석을 시작하세요</p>
          </div>
        </div>
      )}
    </div>
  )
}