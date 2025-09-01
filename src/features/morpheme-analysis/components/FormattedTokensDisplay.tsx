import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FormattedTokensDisplayProps {
  formattedTokens: string
  maxLength?: number
  maxSynonyms?: number
}

export function FormattedTokensDisplay({ 
  formattedTokens, 
  maxLength = 100,
  maxSynonyms = 3 
}: FormattedTokensDisplayProps) {
  const [expanded, setExpanded] = useState(false)
  
  // formattedTokens 파싱
  const parseFormattedTokens = (text: string) => {
    // "토큰1 토큰2{동의어1|동의어2|동의어3}" 형식 파싱
    const match = text.match(/^([^{]+)(?:\{([^}]+)\})?$/)
    
    if (!match) {
      return { tokens: text, synonyms: [] }
    }
    
    const tokens = match[1].trim()
    const synonymsStr = match[2] || ''
    const synonyms = synonymsStr ? synonymsStr.split('|').map(s => s.trim()) : []
    
    return { tokens, synonyms }
  }
  
  const { tokens, synonyms } = parseFormattedTokens(formattedTokens)
  
  // 표시할 동의어 결정
  const shouldTruncate = !expanded && (
    formattedTokens.length > maxLength || 
    synonyms.length > maxSynonyms
  )
  
  const displayedSynonyms = shouldTruncate 
    ? synonyms.slice(0, maxSynonyms)
    : synonyms
  
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