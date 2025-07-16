import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash2, Check, X } from "lucide-react"
import { SynonymDictionaryForm } from "./SynonymDictionaryForm"

interface SynonymDictionaryItem {
    id: number
    keyword: string
    description?: string
    createdAt: string
    updatedAt: string
    isNew?: boolean
    isEditing?: boolean
}

type SortField = 'keyword' | 'createdAt' | 'updatedAt'
type SortDirection = 'asc' | 'desc'

interface SynonymDictionaryTableProps {
    items: SynonymDictionaryItem[]
    addingItem: boolean
    newKeyword: string
    editingKeyword: string
    highlightedId: number | null
    sortField: SortField
    sortDirection: SortDirection
    onSort: (field: SortField) => void
    onEdit: (item: SynonymDictionaryItem) => void
    onSaveEdit: (item: SynonymDictionaryItem) => void
    onCancelEdit: (item: SynonymDictionaryItem) => void
    onDelete: (id: number) => void
    onNewKeywordChange: (value: string) => void
    onEditingKeywordChange: (value: string) => void
    onSaveNew: () => void
    onCancelNew: () => void
    validateKeyword: (keyword: string) => boolean
}

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const formatKeywordDisplay = (keyword: string) => {
    const parts = keyword.split(',').map(s => s.trim()).filter(s => s)
    if (parts.length >= 2) {
        const [firstKeyword, ...restKeywords] = parts
        return (
            <span>
                <span className="font-semibold text-blue-700">{firstKeyword}</span>
                <span className="text-muted-foreground">, </span>
                <span>{restKeywords.join(', ')}</span>
            </span>
        )
    }
    return keyword
}

const getSortIcon = (field: SortField, sortField: SortField, sortDirection: SortDirection) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
}

export function SynonymDictionaryTable({
    items,
    addingItem,
    newKeyword,
    editingKeyword,
    highlightedId,
    sortField,
    sortDirection,
    onSort,
    onEdit,
    onSaveEdit,
    onCancelEdit,
    onDelete,
    onNewKeywordChange,
    onEditingKeywordChange,
    onSaveNew,
    onCancelNew,
    validateKeyword
}: SynonymDictionaryTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => onSort('keyword')}
                    >
                        <div className="flex items-center gap-2">
                            키워드
                            {getSortIcon('keyword', sortField, sortDirection)}
                        </div>
                    </TableHead>
                    <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => onSort('updatedAt')}
                    >
                        <div className="flex items-center gap-2">
                            수정일
                            {getSortIcon('updatedAt', sortField, sortDirection)}
                        </div>
                    </TableHead>
                    <TableHead>액션</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {addingItem && (
                    <TableRow className="bg-blue-50">
                        <TableCell colSpan={2}>
                            <div className="max-w-md">
                                <SynonymDictionaryForm
                                    mode="add"
                                    keyword={newKeyword}
                                    onKeywordChange={onNewKeywordChange}
                                    isValid={validateKeyword(newKeyword)}
                                />
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex gap-2 justify-start">
                                <Button 
                                    size="sm" 
                                    onClick={onSaveNew}
                                    disabled={!validateKeyword(newKeyword)}
                                >
                                    <Check className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={onCancelNew}>
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
                {items.map((item) => (
                    <TableRow 
                        key={item.id}
                        className={highlightedId === item.id ? "bg-yellow-100" : ""}
                    >
                        {item.isEditing ? (
                            <>
                                <TableCell colSpan={2}>
                                    <div className="max-w-md">
                                        <SynonymDictionaryForm
                                            mode="edit"
                                            keyword={editingKeyword}
                                            onKeywordChange={onEditingKeywordChange}
                                            isValid={validateKeyword(editingKeyword)}
                                        />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2 justify-start">
                                        <Button 
                                            size="sm" 
                                            onClick={() => onSaveEdit(item)}
                                            disabled={!validateKeyword(editingKeyword)}
                                        >
                                            <Check className="h-3 w-3" />
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => onCancelEdit(item)}>
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </>
                        ) : (
                            <>
                                <TableCell>
                                    {formatKeywordDisplay(item.keyword)}
                                </TableCell>
                                <TableCell>{formatDate(item.updatedAt)}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => onEdit(item)}
                                        >
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="destructive" 
                                            onClick={() => onDelete(item.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
} 