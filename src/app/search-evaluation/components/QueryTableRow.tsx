import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, Trash2, Sparkles } from "lucide-react"
import type { EvaluationQuery } from "@/services"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface QueryTableRowProps {
  query: EvaluationQuery
  isSelected: boolean
  onSelect: (queryId: number, queryText: string, checked: boolean) => void
  onQueryClick: (queryId: number, queryText: string) => void
  onEdit: (queryId: number, queryText: string) => void
  onDelete: (queryId: number) => void
  isDeleting: boolean
  rowClassName?: string
}

export function QueryTableRow({
  query,
  isSelected,
  onSelect,
  onQueryClick,
  onEdit,
  onDelete,
  isDeleting,
  rowClassName
}: QueryTableRowProps) {
  // 실제 백엔드 필드명 사용 (기본값 처리)
  const documentCount = query.documentCount ?? 0
  const score1Count = query.score1Count ?? 0
  const score0Count = query.score0Count ?? 0
  const unevaluatedCount = query.unevaluatedCount ?? 0

  return (
    <TableRow 
      className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''} ${rowClassName || ''}`}
    >
      <TableCell className="py-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => {
            onSelect(query.id, query.query, checked === true)
          }}
        />
      </TableCell>
      <TableCell className="py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onQueryClick(query.id, query.query)}
            className="text-left hover:text-blue-600 transition-colors font-medium text-xs"
          >
            {query.query}
          </button>
          {(query.expandedTokens || query.expandedSynonymsMap) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      확장
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="space-y-2 text-xs">
                    {query.expandedTokens && (
                      <div>
                        <span className="font-semibold">토큰:</span> {query.expandedTokens}
                      </div>
                    )}
                    {query.expandedSynonymsMap && (() => {
                      try {
                        const synonymsMap = JSON.parse(query.expandedSynonymsMap) as Record<string, string[]>
                        return (
                          <div className="space-y-1">
                            <span className="font-semibold">동의어:</span>
                            {Object.entries(synonymsMap).map(([token, synonyms]) => (
                              <div key={token} className="ml-2">
                                <span className="font-medium">{token}:</span> {synonyms.join(', ')}
                              </div>
                            ))}
                          </div>
                        )
                      } catch (e) {
                        return null
                      }
                    })()}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
      <TableCell className="py-2 text-center">
        <Badge variant={documentCount > 0 ? "default" : "secondary"} className="text-xs">
          {documentCount}
        </Badge>
      </TableCell>
      <TableCell className="py-2 text-center">
        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">{score1Count}</Badge>
      </TableCell>
      <TableCell className="py-2 text-center">
        <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">{score0Count}</Badge>
      </TableCell>
      <TableCell className="py-2 text-center">
        <Badge variant="secondary" className="text-xs">{unevaluatedCount}</Badge>
      </TableCell>
      <TableCell className="py-2">
        <div className="flex gap-1 justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(query.id, query.query)}
            className="h-6 w-6 p-0 border-gray-300 hover:bg-gray-100"
          >
            <Edit className="h-3 w-3" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(query.id)}
            disabled={isDeleting}
            className="h-6 w-6 p-0 border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
} 