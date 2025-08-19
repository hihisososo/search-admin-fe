import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, Trash2 } from "lucide-react"
import type { EvaluationQuery } from "@/services"

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
  const score2Count = query.score2Count ?? 0
  const score1Count = query.score1Count ?? 0
  const score0Count = query.score0Count ?? 0
  const scoreMinus1Count = query.scoreMinus1Count ?? 0
  const reviewed = query.reviewed === true
  const humanReviewCount = reviewed ? 0 : scoreMinus1Count

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
        <button
          onClick={() => onQueryClick(query.id, query.query)}
          className="text-left hover:text-blue-600 transition-colors font-medium text-xs"
        >
          {query.query}
        </button>
      </TableCell>
      <TableCell className="py-2 text-center">
        <Badge variant={documentCount > 0 ? "default" : "secondary"} className="text-xs">
          {documentCount}
        </Badge>
      </TableCell>
      <TableCell className="py-2 text-center">
        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">{score2Count}</Badge>
      </TableCell>
      <TableCell className="py-2 text-center">
        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">{score1Count}</Badge>
      </TableCell>
      <TableCell className="py-2 text-center">
        <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">{score0Count}</Badge>
      </TableCell>
      <TableCell className="py-2 text-center">
        <Badge variant="secondary" className="text-xs">{scoreMinus1Count}</Badge>
      </TableCell>
      <TableCell className="py-2 text-center">
        <Badge
          variant="outline"
          className={`text-xs ${humanReviewCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
        >
          {humanReviewCount}
        </Badge>
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