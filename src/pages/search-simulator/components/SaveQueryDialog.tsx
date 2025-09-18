import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SaveQueryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    queryName: string
    onQueryNameChange: (name: string) => void
    queryDescription: string
    onQueryDescriptionChange: (description: string) => void
    saving: boolean
    onSave: () => void
}

export function SaveQueryDialog({
    open,
    onOpenChange,
    queryName,
    onQueryNameChange,
    queryDescription,
    onQueryDescriptionChange,
    saving,
    onSave
}: SaveQueryDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>쿼리 저장</DialogTitle>
                    <DialogDescription>
                        현재 쿼리를 저장하여 나중에 다시 사용할 수 있습니다.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>쿼리 이름</Label>
                        <Input
                            value={queryName}
                            onChange={(e) => onQueryNameChange(e.target.value)}
                            placeholder="쿼리 이름을 입력하세요"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>설명 (선택사항)</Label>
                        <Input
                            value={queryDescription}
                            onChange={(e) => onQueryDescriptionChange(e.target.value)}
                            placeholder="쿼리에 대한 설명을 입력하세요"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        취소
                    </Button>
                    <Button onClick={onSave} disabled={saving}>
                        {saving ? "저장 중..." : "저장"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 