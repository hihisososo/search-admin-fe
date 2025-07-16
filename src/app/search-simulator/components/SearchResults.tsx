import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import { ResultsTable } from "./ResultsTable"
import type { ElasticsearchResponse, SearchResponse } from "../types"

interface SearchResultsProps {
    searchResults: SearchResponse | null
}

export function SearchResults({ searchResults }: SearchResultsProps) {
    const displayResults: ElasticsearchResponse | undefined = searchResults?.searchResult

    if (!displayResults) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">검색을 실행해보세요</p>
                    <p className="text-sm">인덱스를 선택하고 쿼리를 입력한 후 검색 버튼을 눌러주세요.</p>
                </div>
            </div>
        )
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>검색 결과</CardTitle>
                <CardDescription>
                    총 {displayResults.hits.total.value}개 문서 검색됨 (소요시간: {displayResults.took}ms)
                    {searchResults?.indexName && ` | 인덱스: ${searchResults.indexName}`}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
                <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                    {/* 검색 결과 테이블 */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <h4 className="font-medium mb-3">검색 결과</h4>
                        <div className="flex-1 overflow-auto">
                            <ResultsTable hits={displayResults.hits.hits} />
                        </div>
                    </div>

                    {/* 집계 결과 */}
                    {displayResults.aggregations && (
                        <div className="max-h-48 flex-shrink-0">
                            <h4 className="font-medium mb-3">집계 결과</h4>
                            <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto border whitespace-pre-wrap max-h-40">
                                {JSON.stringify(displayResults.aggregations, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
} 