import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { QueryAnalysisResponse } from '@/services/morpheme-analysis/types'

interface AnalysisResultProps {
  result: QueryAnalysisResponse
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  return (
    <div className="space-y-6">
      {/* 동의어 확장 */}
      {Object.keys(result.noriAnalysis.synonymExpansions).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">동의어 확장</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(result.noriAnalysis.synonymExpansions).map(([token, synonyms]) => (
                <div key={token} className="flex items-start gap-3">
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded min-w-[100px] text-center">
                    {token}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {synonyms.map((synonym, index) => (
                      <Badge key={index} variant="outline">
                        {synonym}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 단위 추출 */}
      {result.units.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">단위 추출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.units.map((unit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded min-w-[100px] text-center">
                    {unit.original}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {unit.expanded.map((expansion, idx) => (
                      <Badge key={idx} variant="outline">
                        {expansion}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 모델명 추출 */}
      {result.models.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">모델명 추출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.models.map((model, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {model}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}