import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { EVALUATION_CONFIG } from "@/constants/evaluation"

interface QueryGenerationDialogProps {
  onGenerate: (count: number) => Promise<void>
  isGenerating: boolean
  isTaskRunning: boolean
  disabled?: boolean
}

export function QueryGenerationDialog({
  onGenerate,
  isGenerating,
  isTaskRunning,
  disabled = false
}: QueryGenerationDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [queryCount, setQueryCount] = useState<number>(EVALUATION_CONFIG.DEFAULT_QUERY_COUNT)

  const handleGenerate = async () => {
    try {
      await onGenerate(queryCount)
      setIsOpen(false)
    } catch (error) {
      // 에러는 부모에서 처리
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled}>
          <Plus className="h-4 w-4 mr-2" />
          쿼리 자동생성
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>쿼리 자동생성</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="queryCount" className="text-sm font-medium">
              생성 개수
            </Label>
            <Input
              id="queryCount"
              type="number"
              value={queryCount}
              onChange={(e) => setQueryCount(Number(e.target.value))}
              min="1"
              max={EVALUATION_CONFIG.MAX_QUERY_COUNT}
              className="text-sm mt-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsOpen(false)}
              disabled={isGenerating}
            >
              취소
            </Button>
            <Button 
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating || isTaskRunning}
            >
              {isGenerating ? '시작중...' : '생성'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 