import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Search, Save, BookOpen, Play } from "lucide-react"
import type { IndexItem } from "../types"

interface QueryInputProps {
    indexes: IndexItem[]
    selectedIndex: string
    onSelectedIndexChange: (index: string) => void
    query: string
    onQueryChange: (query: string) => void
    loading: boolean
    onSearch: () => void
    onSaveDialog: () => void
    onLoadDialog: () => void
}

export function QueryInput({
    indexes,
    selectedIndex,
    onSelectedIndexChange,
    query,
    onQueryChange,
    loading,
    onSearch,
    onSaveDialog,
    onLoadDialog
}: QueryInputProps) {
    // query가 string이 아닐 경우 빈 문자열로 대체
    const safeQuery = typeof query === "string" ? query : ""
    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-1">
                <CardTitle className="text-base flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    쿼리 입력
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                <div className="space-y-3 flex-1 flex flex-col">
                    {/* 인덱스 선택 - 인라인 */}
                    <div className="flex items-center gap-3">
                        <Label className="text-sm whitespace-nowrap">인덱스 선택:</Label>
                        <select 
                            value={selectedIndex}
                            onChange={(e) => onSelectedIndexChange(e.target.value)}
                            className="flex-1 px-3 py-1 text-sm border rounded-md"
                        >
                            <option value="">인덱스를 선택하세요</option>
                            {indexes.map(index => (
                                <option key={index.name} value={index.name}>
                                    {index.name} {index.description && `(${index.description})`}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="space-y-2 flex-1 flex flex-col">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm">ES Query DSL</Label>
                            <div className="flex items-center gap-1">
                                {/* 쿼리 저장 버튼 */}
                                <Button variant="outline" size="sm" onClick={onSaveDialog} className="px-2 text-xs">
                                    <Save className="h-3 w-3" />
                                </Button>

                                {/* 쿼리 불러오기 버튼 */}
                                <Button variant="outline" size="sm" onClick={onLoadDialog} className="px-2 text-xs">
                                    <BookOpen className="h-3 w-3" />
                                </Button>

                                {/* 검색 실행 버튼 */}
                                <Button 
                                    onClick={onSearch} 
                                    disabled={loading || !selectedIndex || !safeQuery.trim()}
                                    variant="outline"
                                    className="px-2 text-xs"
                                    size="sm"
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900"></div>
                                    ) : (
                                        <Play className="h-3 w-3" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        <textarea
                            value={safeQuery}
                            onChange={(e) => onQueryChange(e.target.value)}
                            className="w-full flex-1 font-mono text-sm rounded-md border border-gray-200 p-3 resize-none"
                            placeholder='{"query": {"match_all": {}}, "size": 10}'
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 