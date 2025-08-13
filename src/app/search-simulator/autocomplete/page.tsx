import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EnvironmentSelector } from "@/app/dictionary/user/components/EnvironmentSelector"
import { DictionaryEnvironmentType } from "@/types/dashboard"
import type { AutocompleteResponse } from "@/lib/api"
import { enhancedSearchApi } from "@/lib/api"

export default function AutocompleteSimulatorPage() {
  const [selectedEnv, setSelectedEnv] = useState<DictionaryEnvironmentType>(DictionaryEnvironmentType.DEV)
  const [keyword, setKeyword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])

  const envLabel = useMemo(() => selectedEnv === DictionaryEnvironmentType.PROD ? "운영" : "개발", [selectedEnv])

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!keyword.trim()) {
        setSuggestions([])
        return
      }
      setLoading(true)
      setError("")
      try {
        // 시뮬레이션 자동완성 엔드포인트 사용
        const res: AutocompleteResponse = await enhancedSearchApi.simulateAutocomplete({
          keyword,
          environmentType: selectedEnv,
        })
        setSuggestions(res.suggestions || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : "자동완성 조회 실패")
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 200)
    return () => clearTimeout(timeout)
  }, [keyword, selectedEnv])

  return (
    <div className="p-6">
      <div className="space-y-4">
        <div className="flex justify-start">
          <EnvironmentSelector value={selectedEnv} onChange={setSelectedEnv} />
        </div>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={`자동완성 키워드 입력 (${envLabel})`}
              className="h-9 max-w-md"
            />
            <Button variant="outline" size="sm" onClick={() => setKeyword("")}>초기화</Button>
          </div>
          {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-2">응답 {loading ? '조회중...' : `${suggestions.length}건`}</div>
            <ul className="space-y-1">
              {suggestions.map((s, i) => (
                <li key={`${s}-${i}`} className="text-sm px-3 py-1 rounded hover:bg-muted cursor-default border border-transparent hover:border-muted-foreground/10">
                  {s}
                </li>
              ))}
              {!loading && suggestions.length === 0 && keyword.trim() && (
                <li className="text-sm text-muted-foreground">결과 없음</li>
              )}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}


