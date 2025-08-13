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
  const correctCount = query.correctCount ?? 0
  const incorrectCount = query.incorrectCount ?? 0
  const unspecifiedCount = query.unspecifiedCount ?? 0

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
        <Badge variant={documentCount > 0 ? "default" : "secondary"} className="text-xs py-0.5 px-2">
          {documentCount}
        </Badge>
      </TableCell>
      <TableCell className="py-2 text-center">
        <Badge variant="default" className="bg-green-600 text-xs py-0.5 px-2">
          {correctCount}
        </Badge>
      </TableCell>
      <TableCell className="py-2 text-center">
        <Badge variant="destructive" className="text-xs py-0.5 px-2">
          {incorrectCount}
        </Badge>
      </TableCell>
      <TableCell className="py-2 text-center">
        <Badge variant="secondary" className="text-xs py-0.5 px-2">
          {unspecifiedCount}
        </Badge>
      </TableCell>
      <TableCell className="py-2 text-center">
        <div className="flex gap-1 justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(query.id, query.query)}
            className="h-7 w-7 p-0"
          >
            <Edit className="h-3 w-3" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(query.id)}
            disabled={isDeleting}
            className="h-7 w-7 p-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
} 