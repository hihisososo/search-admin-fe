import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SquarePen } from "lucide-react"

interface QueryCreateDialogProps {
  onCreate: (text: string) => Promise<void>
  isCreating?: boolean
  disabled?: boolean
}

export function QueryCreateDialog({ onCreate, isCreating = false, disabled = false }: QueryCreateDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [text, setText] = useState("")
  

  const canSubmit = text.trim().length > 0

  const handleCreate = async () => {
    if (!canSubmit) return
    try {
      await onCreate(text.trim())
      setText("")
      setIsOpen(false)
    } catch (_err) {
      // 에러는 상위에서 처리
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled}>
          <SquarePen className="h-4 w-4 mr-1" />
          쿼리 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>쿼리 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Input
              id="manualQuery"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="쿼리를 입력하세요"
              className="text-sm mt-1"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)} disabled={isCreating}>취소</Button>
            <Button size="sm" variant="outline" onClick={handleCreate} disabled={!canSubmit || isCreating}>
              {isCreating ? '추가중...' : '추가'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

