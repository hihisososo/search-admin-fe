import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import type { SearchResult } from "../types"

interface ResultsTableProps {
    hits: SearchResult[]
}

export function ResultsTable({ hits }: ResultsTableProps) {
    if (hits.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                검색 결과가 없습니다.
            </div>
        )
    }

    // 모든 키 수집
    const allKeys = new Set<string>()
    hits.forEach((hit: SearchResult) => {
        if (hit._source && typeof hit._source === 'object') {
            Object.keys(hit._source).forEach(key => allKeys.add(key))
        }
    })

    return (
        <div className="border rounded-md overflow-auto h-full">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                        {/* 동적으로 1depth 키들을 헤더로 생성 */}
                        {Array.from(allKeys).map(key => (
                            <TableHead key={key} className="min-w-[120px] py-2 text-xs font-semibold text-gray-700">
                                {key}
                            </TableHead>
                        ))}
                        <TableHead className="w-20 py-2 text-xs font-semibold text-gray-700">_score</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {hits.map((hit: SearchResult, index: number) => {
                        return (
                            <TableRow key={`${hit._id}-${index}`} className="hover:bg-gray-50">
                                {/* 각 키에 해당하는 값 표시 */}
                                {Array.from(allKeys).map(key => {
                                    const value = hit._source?.[key]
                                    return (
                                        <TableCell key={key} className="text-xs max-w-[200px]">
                                            {value === null || value === undefined ? (
                                                <span className="text-gray-400">-</span>
                                            ) : Array.isArray(value) ? (
                                                <span className="text-blue-600">
                                                    [{value.map(v => typeof v === 'string' ? `"${v}"` : String(v)).join(', ')}]
                                                </span>
                                            ) : typeof value === 'object' ? (
                                                <details className="cursor-pointer">
                                                    <summary className="text-gray-600 hover:text-gray-800">
                                                        {`{${Object.keys(value).length} keys}`}
                                                    </summary>
                                                    <pre className="text-xs bg-gray-50 p-2 rounded mt-1 whitespace-pre-wrap max-h-32 overflow-auto">
                                                        {JSON.stringify(value, null, 2)}
                                                    </pre>
                                                </details>
                                            ) : typeof value === 'string' ? (
                                                <span className="break-words" title={value}>
                                                    {value.length > 50 ? `${value.substring(0, 50)}...` : value}
                                                </span>
                                            ) : typeof value === 'number' ? (
                                                <span className="font-mono text-green-600">
                                                    {value.toLocaleString()}
                                                </span>
                                            ) : (
                                                <span className="text-purple-600">
                                                    {String(value)}
                                                </span>
                                            )}
                                        </TableCell>
                                    )
                                })}
                                <TableCell className="font-mono text-xs">{hit._score?.toFixed(4)}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
} 