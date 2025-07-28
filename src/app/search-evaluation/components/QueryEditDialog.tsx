import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface QueryEditDialogProps {
  editingQuery: { id: number; text: string } | null
  onSave: (queryId: number, newText: string) => Promise<void>
  onClose: () => void
  isSaving: boolean
}

export function QueryEditDialog({
  editingQuery,
  onSave,
  onClose,
  isSaving
}: QueryEditDialogProps) {
  const [queryText, setQueryText] = useState("")

  useEffect(() => {
    if (editingQuery) {
      setQueryText(editingQuery.text)
    }
  }, [editingQuery])

  const handleSave = async () => {
    if (!editingQuery || !queryText.trim()) {
      alert('쿼리 텍스트를 입력해주세요.')
      return
    }

    try {
      await onSave(editingQuery.id, queryText.trim())
      onClose()
    } catch (error) {
      // 에러는 부모에서 처리
    }
  }

  const handleClose = () => {
    setQueryText("")
    onClose()
  }

  return (
    <Dialog open={!!editingQuery} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>쿼리 수정</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            className="text-sm"
            placeholder="쿼리를 입력하세요"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSave()
              }
            }}
          />
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClose}
              disabled={isSaving}
            >
              취소
            </Button>
            <Button 
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !queryText.trim()}
            >
              {isSaving ? '저장중...' : '저장'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 