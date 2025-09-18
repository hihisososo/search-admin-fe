'use client'

import { useState, useEffect, useCallback } from 'react'
import { userDictionaryService } from '@/services'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import type { MorphemeToken } from '@/services/dictionary/types'
import type { Environment } from '@/services/common/types'
import { useDebounce } from '@/hooks/use-debounce'

interface MorphemeAnalyzerProps {
  text: string
  environment?: Environment
  className?: string
}

export function MorphemeAnalyzer({ text, environment = 'DEV', className }: MorphemeAnalyzerProps) {
  const [tokens, setTokens] = useState<MorphemeToken[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const debouncedText = useDebounce(text, 500)

  const analyzeText = useCallback(async (textToAnalyze: string) => {
    if (!textToAnalyze.trim()) {
      setTokens([])
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const response = await userDictionaryService.analyzeText(textToAnalyze, environment)
      setTokens(response.tokens)
    } catch (err) {
      console.error('형태소 분석 실패:', err)
      setError('형태소 분석 중 오류가 발생했습니다.')
      setTokens([])
    } finally {
      setLoading(false)
    }
  }, [environment])

  useEffect(() => {
    analyzeText(debouncedText)
  }, [debouncedText, analyzeText])

  if (!text.trim()) return null

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">형태소 분석 결과</h4>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
        
        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : tokens.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tokens.map((token, index) => (
              <div key={index} className="flex items-center gap-1">
                <Badge variant="outline" className="font-mono">
                  {token.token}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {token.type}
                </span>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <p className="text-sm text-muted-foreground">
              분석 결과가 없습니다.
            </p>
          )
        )}
        
        {tokens.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              총 {tokens.length}개 토큰으로 분석됨
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}