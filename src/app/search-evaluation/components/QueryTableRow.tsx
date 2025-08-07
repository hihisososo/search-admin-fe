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
}

export function QueryTableRow({
  query,
  isSelected,
  onSelect,
  onQueryClick,
  onEdit,
  onDelete,
  isDeleting
}: QueryTableRowProps) {
  // 실제 백엔드 필드명 사용 (기본값 처리)
  const documentCount = query.documentCount ?? 0
  const correctCount = query.correctCount ?? 0
  const incorrectCount = query.incorrectCount ?? 0
  const unspecifiedCount = query.unspecifiedCount ?? 0

  return (
    <TableRow 
      className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
    >
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => {
            onSelect(query.id, query.query, checked === true)
          }}
        />
      </TableCell>
      <TableCell>
        <button
          onClick={() => onQueryClick(query.id, query.query)}
          className="text-left hover:text-blue-600 transition-colors font-medium"
        >
          {query.query}
        </button>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant={documentCount > 0 ? "default" : "secondary"}>
          {documentCount}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="default" className="bg-green-600">
          {correctCount}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="destructive">
          {incorrectCount}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="secondary">
          {unspecifiedCount}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
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