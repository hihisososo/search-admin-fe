import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { MorphemeAnalysisResponse } from "@/services/morpheme-analysis/types"

interface AnalysisResultProps {
  result: MorphemeAnalysisResponse
}

// 토큰 타입별 색상 매핑
const TOKEN_TYPE_COLORS: Record<string, string> = {
  'SYNONYM': 'bg-blue-100 text-blue-800',
  'NNG': 'bg-green-100 text-green-800',
  'NNP': 'bg-purple-100 text-purple-800',
  'VV': 'bg-red-100 text-red-800',
  'VA': 'bg-orange-100 text-orange-800',
  'SN': 'bg-yellow-100 text-yellow-800',
  'WORD': 'bg-gray-100 text-gray-800',
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  return (
    <div className="space-y-4">
      {/* 원본 쿼리 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">원본 쿼리</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg">{result.originalQuery}</span>
            <Badge variant="outline" className="ml-auto">
              {result.environment}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 형태소 분석 결과 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">형태소 분석 결과</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* 토큰 목록 */}
            <div>
              <h4 className="text-sm font-medium mb-2">토큰 분석</h4>
              <div className="flex flex-wrap gap-2">
                {result.noriAnalysis.tokens.map((token, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <Badge 
                      className={`${TOKEN_TYPE_COLORS[token.type] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {token.token}
                    </Badge>
                    <span className="text-xs text-gray-500 mt-1">
                      {token.type}
                    </span>
                    <span className="text-xs text-gray-400">
                      pos: {token.position}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 토큰 및 동의어 */}
            {result.noriAnalysis.formattedTokens && (
              <div>
                <h4 className="text-sm font-medium mb-2">토큰 및 동의어 확장</h4>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-xs font-mono text-gray-700 break-all">
                    {result.noriAnalysis.formattedTokens}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 단위 정보 */}
      {result.units && result.units.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">추출된 단위</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.units.map((unit, index) => (
                <div key={index} className="border-l-2 border-blue-500 pl-3">
                  <div className="font-medium text-sm mb-1">{unit.original}</div>
                  <div className="flex flex-wrap gap-1">
                    {unit.expanded.map((exp, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {exp}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 모델명 */}
      {result.models && result.models.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">추출된 모델명</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.models.map((model, index) => (
                <Badge key={index} variant="default">
                  {model}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 상세 정보 (JSON) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">상세 정보 (JSON)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}