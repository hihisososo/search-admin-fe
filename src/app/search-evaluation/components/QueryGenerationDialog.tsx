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
import type { GenerateQueriesRequest } from "@/services/evaluation/types"
 

interface QueryGenerationDialogProps {
  onGenerate: (data: GenerateQueriesRequest) => Promise<void>
  isGenerating: boolean
  isTaskRunning: boolean
  disabled?: boolean
  progressText?: string
}

export function QueryGenerationDialog({
  onGenerate,
  isGenerating,
  isTaskRunning,
  disabled = false,
  progressText
}: QueryGenerationDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [queryCount, setQueryCount] = useState<string>(String(EVALUATION_CONFIG.DEFAULT_QUERY_COUNT))
 

  const handleGenerate = async () => {
    try {
      const count = parseInt(queryCount) || EVALUATION_CONFIG.DEFAULT_QUERY_COUNT
      const payload: GenerateQueriesRequest = {
        count: count,
      }
      setIsOpen(false)
      await onGenerate(payload)
    } catch (_error) {
      // 에러는 부모에서 처리
    }
  }

  // 다이얼로그가 열릴 때만 카테고리 조회 (enabled: isOpen)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled} className={isTaskRunning ? 'flash-indigo' : ''}>
          {isGenerating || isTaskRunning ? (
            <>
              <span className="mr-2 inline-flex"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"></svg></span>
              {isGenerating ? '시작중...' : (progressText || '진행중...')}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              정답셋 자동생성
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>정답셋 자동생성</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label htmlFor="queryCount" className="text-sm font-medium">생성 개수</Label>
              <Input
                id="queryCount"
                type="text"
                value={queryCount}
                onChange={(e) => setQueryCount(e.target.value)}
                placeholder="생성할 개수 입력"
                className="text-sm mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">1 ~ {EVALUATION_CONFIG.MAX_QUERY_COUNT} 사이의 숫자를 입력하세요</p>
            </div>
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
              disabled={isGenerating || isTaskRunning || !queryCount || parseInt(queryCount) < 1 || parseInt(queryCount) > EVALUATION_CONFIG.MAX_QUERY_COUNT}
            >
              {isGenerating ? '시작중...' : '생성'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 