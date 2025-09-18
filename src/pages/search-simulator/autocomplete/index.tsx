import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { EnvironmentSelector } from "@/pages/dictionary/user/components/EnvironmentSelector"
import { Environment as DictionaryEnvironmentType } from '@/services/common/types'
import type { AutocompleteResponse } from "@/lib/api"
import { searchApi } from "@/lib/api"

export default function AutocompleteSimulatorPage() {
  const [selectedEnv, setSelectedEnv] = useState<DictionaryEnvironmentType>(DictionaryEnvironmentType.DEV)
  const [keyword, setKeyword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])

  // const envLabel = useMemo(() => selectedEnv === DictionaryEnvironmentType.PROD ? "운영" : "개발", [selectedEnv])

  const highlight = (text: string, keyword: string) => {
    if (!keyword) return text
    const tokens = keyword.trim().split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return text
    const escaped = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    const regex = new RegExp(`(${escaped.join('|')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, idx) =>
      regex.test(part)
        ? <span key={idx} className="text-blue-600 font-semibold">{part}</span>
        : <span key={idx}>{part}</span>
    )
  }

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!keyword.trim()) {
        setSuggestions([])
        return
      }
      setLoading(true)
      setError("")
      try {
        // 자동완성 시뮬레이션 엔드포인트 사용
        const res: AutocompleteResponse = await searchApi.getAutocompleteSimulation(keyword, selectedEnv)
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
          <EnvironmentSelector
            value={selectedEnv}
            onChange={setSelectedEnv}
            excludeOptions={[DictionaryEnvironmentType.CURRENT]} />
        </div>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="자동완성 키워드 입력"
              className="h-9 max-w-md"
            />
          </div>
          {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-2">응답 {loading ? '조회중...' : `${suggestions.length}건`}</div>
            <ul className="space-y-1">
              {suggestions.map((s, i) => (
                <li key={`${s}-${i}`} className="text-sm px-3 py-1 rounded hover:bg-muted cursor-default border border-transparent hover:border-muted-foreground/10">
                  {highlight(s, keyword)}
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


