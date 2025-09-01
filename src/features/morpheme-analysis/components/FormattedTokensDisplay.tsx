import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FormattedTokensDisplayProps {
  formattedTokens: string
  synonymExpansions?: Record<string, string[]>
  maxLength?: number
  maxSynonyms?: number
}

export function FormattedTokensDisplay({ 
  formattedTokens, 
  synonymExpansions,
  maxLength = 100,
  maxSynonyms = 3 
}: FormattedTokensDisplayProps) {
  const [expanded, setExpanded] = useState(false)
  
  // synonymExpansions가 있으면 우선 사용, 없으면 formattedTokens 파싱
  const getSynonymData = () => {
    if (synonymExpansions && Object.keys(synonymExpansions).length > 0) {
      // synonymExpansions 사용
      return {
        type: 'structured' as const,
        data: synonymExpansions
      }
    } else {
      // formattedTokens 파싱
      const match = formattedTokens.match(/^([^{]+)(?:\{([^}]+)\})?$/)
      
      if (!match) {
        return {
          type: 'formatted' as const,
          tokens: formattedTokens,
          synonyms: []
        }
      }
      
      const tokens = match[1].trim()
      const synonymsStr = match[2] || ''
      const synonyms = synonymsStr ? synonymsStr.split('|').map(s => s.trim()) : []
      
      return {
        type: 'formatted' as const,
        tokens,
        synonyms
      }
    }
  }
  
  const synonymData = getSynonymData()
  
  // structured 타입일 때 렌더링
  if (synonymData.type === 'structured') {
    const entries = Object.entries(synonymData.data)
    const shouldTruncate = !expanded && entries.length > maxSynonyms
    const displayedEntries = shouldTruncate ? entries.slice(0, maxSynonyms) : entries
    const remainingCount = entries.length - displayedEntries.length
    
    return (
      <div className="space-y-2">
        {displayedEntries.map(([token, synonyms]) => (
          <div key={token} className="flex items-start gap-2">
            <span className="text-xs font-medium text-gray-700 min-w-[60px]">{token}:</span>
            <div className="flex flex-wrap gap-1">
              {synonyms.map((synonym, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="text-xs font-mono"
                >
                  {synonym}
                </Badge>
              ))}
            </div>
          </div>
        ))}
        
        {/* 더보기/접기 버튼 */}
        <div className="flex items-center gap-2 pl-[60px]">
          {shouldTruncate && remainingCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(true)}
              className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
            >
              <span>외 {remainingCount}개 토큰 더보기</span>
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          )}
          
          {expanded && entries.length > maxSynonyms && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(false)}
              className="h-6 px-2 text-xs text-gray-600 hover:text-gray-700"
            >
              <span>접기</span>
              <ChevronUp className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    )
  }
  
  // formatted 타입일 때 렌더링 (기존 로직)
  const { tokens, synonyms } = synonymData
  const shouldTruncate = !expanded && (
    formattedTokens.length > maxLength || 
    synonyms.length > maxSynonyms
  )
  const displayedSynonyms = shouldTruncate ? synonyms.slice(0, maxSynonyms) : synonyms
  const remainingSynonyms = synonyms.length - displayedSynonyms.length
  
  return (
    <div className="space-y-2">
      {/* 원본 토큰 */}
      <div className="flex items-start gap-2">
        <span className="text-xs font-medium text-gray-600 min-w-[40px]">원본:</span>
        <span className="text-xs font-mono text-gray-900">{tokens}</span>
      </div>
      
      {/* 동의어 */}
      {synonyms.length > 0 && (
        <div className="flex items-start gap-2">
          <span className="text-xs font-medium text-gray-600 min-w-[40px]">동의어:</span>
          <div className="flex-1">
            <div className="flex flex-wrap gap-1 items-center">
              {displayedSynonyms.map((synonym, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="text-xs font-mono"
                >
                  {synonym}
                </Badge>
              ))}
              
              {/* 더보기/접기 버튼 */}
              {shouldTruncate && remainingSynonyms > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded(true)}
                  className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
                >
                  <span>외 {remainingSynonyms}개 더보기</span>
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              )}
              
              {expanded && synonyms.length > maxSynonyms && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded(false)}
                  className="h-6 px-2 text-xs text-gray-600 hover:text-gray-700"
                >
                  <span>접기</span>
                  <ChevronUp className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 동의어가 없는 경우 */}
      {synonyms.length === 0 && (
        <div className="flex items-start gap-2">
          <span className="text-xs font-medium text-gray-600 min-w-[40px]">동의어:</span>
          <span className="text-xs text-gray-400">없음</span>
        </div>
      )}
    </div>
  )
}