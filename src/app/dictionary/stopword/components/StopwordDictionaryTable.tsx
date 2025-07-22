import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash2, Check, X } from "lucide-react"
import { DictionaryEnvironmentType } from "@/types/dashboard"
import type { DictionaryItem, DictionarySortField, DictionarySortDirection } from "@/types/dashboard"

interface StopwordDictionaryTableProps {
    items: DictionaryItem[]
    addingItem: boolean
    newKeyword: string
    editingKeyword: string
    highlightedId: number | null
    sortField: DictionarySortField
    sortDirection: DictionarySortDirection
    onSort: (field: DictionarySortField) => void
    onEdit: (item: DictionaryItem) => void
    onSaveEdit: (item: DictionaryItem) => void
    onCancelEdit: (item: DictionaryItem) => void
    onDelete: (id: number) => void
    onNewKeywordChange: (value: string) => void
    onEditingKeywordChange: (value: string) => void
    onSaveNew: () => void
    onCancelNew: () => void
    validateKeyword: (keyword: string) => boolean
    environment: DictionaryEnvironmentType
    canEdit: boolean
}

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const formatStopwordDisplay = (keyword: string) => {
    return (
        <span className="font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs">
            {keyword}
        </span>
    )
}

const getSortIcon = (field: DictionarySortField, sortField: DictionarySortField, sortDirection: DictionarySortDirection) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5" />
    return sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
}

export function StopwordDictionaryTable({
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
    validateKeyword,
    environment,
    canEdit
}: StopwordDictionaryTableProps) {
    return (
        <div className="border border-gray-200 rounded-md overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead
                            className="cursor-pointer hover:bg-gray-100 py-2 text-xs font-semibold text-gray-700"
                            onClick={() => onSort('keyword')}
                        >
                            <div className="flex items-center gap-1">
                                불용어
                                {getSortIcon('keyword', sortField, sortDirection)}
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-gray-100 py-2 text-xs font-semibold text-gray-700 w-24"
                            onClick={() => onSort('updatedAt')}
                        >
                            <div className="flex items-center gap-1">
                                수정일
                                {getSortIcon('updatedAt', sortField, sortDirection)}
                            </div>
                        </TableHead>
                        {canEdit && <TableHead className="py-2 text-xs font-semibold text-gray-700 w-20">액션</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {addingItem && canEdit && (
                        <TableRow className="bg-blue-50 hover:bg-blue-50">
                            <TableCell className="py-2">
                                <div className="space-y-2">
                                    <Input
                                        placeholder="불용어를 입력하세요 (예: 그)"
                                        value={newKeyword}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNewKeywordChange(e.target.value)}
                                        className="h-7 text-xs"
                                    />
                                    {!validateKeyword(newKeyword) && (
                                        <div className="text-red-600 text-xs">불용어는 단일 단어로 입력해주세요. (콤마나 특수문자 불가)</div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="py-2 text-xs text-gray-500">
                                -
                            </TableCell>
                            <TableCell className="py-2">
                                <div className="flex gap-1">
                                    <Button
                                        size="sm"
                                        onClick={onSaveNew}
                                        disabled={!validateKeyword(newKeyword)}
                                        className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700"
                                    >
                                        <Check className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={onCancelNew}
                                        className="h-6 w-6 p-0 border-gray-300"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                    {items.map((item) => (
                        <TableRow
                            key={item.id}
                            className={`hover:bg-gray-50 ${highlightedId === item.id ? "bg-amber-50" : ""}`}
                        >
                            {item.isEditing && canEdit ? (
                                <>
                                    <TableCell className="py-2">
                                        <div className="space-y-2">
                                            <Input
                                                placeholder="불용어를 입력하세요"
                                                value={editingKeyword}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onEditingKeywordChange(e.target.value)}
                                                className="h-7 text-xs"
                                            />
                                            {!validateKeyword(editingKeyword) && (
                                                <div className="text-red-600 text-xs">불용어는 단일 단어로 입력해주세요. (콤마나 특수문자 불가)</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-2 text-xs text-gray-500">
                                        {formatDate(item.updatedAt)}
                                    </TableCell>
                                    <TableCell className="py-2">
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                onClick={() => onSaveEdit(item)}
                                                disabled={!validateKeyword(editingKeyword)}
                                                className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700"
                                            >
                                                <Check className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onCancelEdit(item)}
                                                className="h-6 w-6 p-0 border-gray-300"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </>
                            ) : (
                                <>
                                    <TableCell className="py-2">
                                        <div className="break-words">
                                            {formatStopwordDisplay(item.keyword)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-2 text-xs text-gray-500">
                                        {formatDate(item.updatedAt)}
                                    </TableCell>
                                    {canEdit && (
                                        <TableCell className="py-2">
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => onEdit(item)}
                                                    className="h-6 w-6 p-0 border-gray-300 hover:bg-gray-100"
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => onDelete(item.id)}
                                                    className="h-6 w-6 p-0 border-red-300 text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    )}
                                </>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
} 