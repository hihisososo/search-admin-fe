import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface StopwordDictionaryHeaderProps {
    search: string
    onSearchChange: (value: string) => void
    onSearch: () => void
    onAdd: () => void
    addingItem: boolean
    canEdit: boolean
}

export function StopwordDictionaryHeader({
    search,
    onSearchChange,
    onSearch,
    onAdd,
    addingItem,
    canEdit
}: StopwordDictionaryHeaderProps) {
    
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-gray-400" />
                        <Input
                            placeholder="불용어 검색..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                            className="pl-8 h-8 text-sm border-gray-300 focus:border-gray-400"
                        />
                    </div>
                    <Button
                        onClick={onSearch}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs border-gray-300"
                    >
                        검색
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    {canEdit && (
                        <Button
                            onClick={onAdd}
                            disabled={addingItem}
                            size="sm"
                            className="h-8 px-3 text-xs bg-gray-900 hover:bg-gray-800"
                        >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            추가
                        </Button>
                    )}
                </div>
            </div>

            {!canEdit && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-2 text-xs text-amber-800">
                    읽기 전용 환경입니다.
                </div>
            )}
        </div>
    )
} 