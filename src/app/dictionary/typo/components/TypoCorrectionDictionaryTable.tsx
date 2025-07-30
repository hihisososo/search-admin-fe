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
import type { DictionarySortField, DictionarySortDirection } from "@/types/dashboard"
import type { TypoCorrectionDictionaryItem } from "@/services/dictionary/types"

interface TypoCorrectionDictionaryTableProps {
    items: TypoCorrectionDictionaryItem[]
    addingItem: boolean
    newKeyword: string
    newCorrectedWord: string
    editingKeyword: string
    editingCorrectedWord: string
    highlightedId: number | null
    sortField: DictionarySortField
    sortDirection: DictionarySortDirection
    onSort: (field: DictionarySortField) => void
    onEdit: (item: TypoCorrectionDictionaryItem) => void
    onSaveEdit: (item: TypoCorrectionDictionaryItem) => void
    onCancelEdit: (item: TypoCorrectionDictionaryItem) => void
    onDelete: (id: number) => void
    onNewKeywordChange: (value: string) => void
    onNewCorrectedWordChange: (value: string) => void
    onEditingKeywordChange: (value: string) => void
    onEditingCorrectedWordChange: (value: string) => void
    onSaveNew: () => void
    onCancelNew: () => void
    validateTypoCorrection: (keyword: string, correctedWord: string) => boolean
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

const getSortIcon = (field: DictionarySortField, sortField: DictionarySortField, sortDirection: DictionarySortDirection) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5" />
    return sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
}

export function TypoCorrectionDictionaryTable({
    items,
    addingItem,
    newKeyword,
    newCorrectedWord,
    editingKeyword,
    editingCorrectedWord,
    highlightedId,
    sortField,
    sortDirection,
    onSort,
    onEdit,
    onSaveEdit,
    onCancelEdit,
    onDelete,
    onNewKeywordChange,
    onNewCorrectedWordChange,
    onEditingKeywordChange,
    onEditingCorrectedWordChange,
    onSaveNew,
    onCancelNew,
    validateTypoCorrection,
    canEdit
}: TypoCorrectionDictionaryTableProps) {
    return (
        <div className="border border-gray-200 rounded-md overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead
                            className="cursor-pointer hover:bg-gray-100 py-2 text-xs font-semibold text-gray-700 w-1/3"
                            onClick={() => onSort('keyword')}
                        >
                            <div className="flex items-center gap-1">
                                오타 단어
                                {getSortIcon('keyword', sortField, sortDirection)}
                            </div>
                        </TableHead>
                        <TableHead className="py-2 text-xs font-semibold text-gray-700 w-1/3">교정어</TableHead>
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
                                <Input
                                    placeholder="오타 단어를 입력하세요 (예: 삼송)"
                                    value={newKeyword}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNewKeywordChange(e.target.value)}
                                    className="h-7 text-xs"
                                />
                            </TableCell>
                            <TableCell className="py-2">
                                <Input
                                    placeholder="교정어를 입력하세요 (예: 삼성)"
                                    value={newCorrectedWord}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNewCorrectedWordChange(e.target.value)}
                                    className="h-7 text-xs"
                                />
                            </TableCell>
                            <TableCell className="py-2 text-xs text-gray-500">
                                -
                            </TableCell>
                            <TableCell className="py-2">
                                <div className="space-y-1">
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            onClick={onSaveNew}
                                            disabled={!validateTypoCorrection(newKeyword, newCorrectedWord)}
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
                                    {!validateTypoCorrection(newKeyword, newCorrectedWord) && (
                                        <div className="text-red-600 text-xs">오타 단어와 교정어를 모두 입력해주세요.</div>
                                    )}
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
                                        <Input
                                            placeholder="오타 단어를 입력하세요"
                                            value={editingKeyword}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onEditingKeywordChange(e.target.value)}
                                            className="h-7 text-xs"
                                        />
                                    </TableCell>
                                    <TableCell className="py-2">
                                        <Input
                                            placeholder="교정어를 입력하세요"
                                            value={editingCorrectedWord}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onEditingCorrectedWordChange(e.target.value)}
                                            className="h-7 text-xs"
                                        />
                                    </TableCell>
                                    <TableCell className="py-2 text-xs text-gray-500">
                                        {formatDate(item.updatedAt)}
                                    </TableCell>
                                    <TableCell className="py-2">
                                        <div className="space-y-1">
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    onClick={() => onSaveEdit(item)}
                                                    disabled={!validateTypoCorrection(editingKeyword, editingCorrectedWord)}
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
                                            {!validateTypoCorrection(editingKeyword, editingCorrectedWord) && (
                                                <div className="text-red-600 text-xs">오타 단어와 교정어를 모두 입력해주세요.</div>
                                            )}
                                        </div>
                                    </TableCell>
                                </>
                            ) : (
                                <>
                                    <TableCell className="py-2">
                                        <div className="break-words">
                                            <span className="font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs">
                                                {item.keyword}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-2">
                                        <div className="break-words">
                                            <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs">
                                                {item.correctedWord || '-'}
                                            </span>
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