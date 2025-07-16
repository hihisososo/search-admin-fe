import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { SavedQuery } from "../types"

interface LoadQueryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    savedQueries: SavedQuery[]
    onLoadQuery: (query: SavedQuery) => void
    onDeleteQuery: (id: number) => void
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

export function LoadQueryDialog({
    open,
    onOpenChange,
    savedQueries,
    onLoadQuery,
    onDeleteQuery
}: LoadQueryDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>저장된 쿼리</DialogTitle>
                    <DialogDescription>
                        저장된 쿼리를 선택하여 불러올 수 있습니다.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-96 overflow-y-auto">
                    {savedQueries.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            저장된 쿼리가 없습니다.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {savedQueries.map(savedQuery => (
                                <div key={savedQuery.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium">{savedQuery.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {savedQuery.indexName} • {formatDate(savedQuery.createdAt)}
                                        </div>
                                        {savedQuery.description && (
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {savedQuery.description}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Button 
                                            size="sm" 
                                            onClick={() => onLoadQuery(savedQuery)}
                                        >
                                            불러오기
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="destructive"
                                            onClick={() => onDeleteQuery(savedQuery.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
} 