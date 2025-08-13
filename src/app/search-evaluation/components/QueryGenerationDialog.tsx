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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEvaluationCategories } from "@/hooks/use-evaluation"

interface QueryGenerationDialogProps {
  onGenerate: (data: GenerateQueriesRequest) => Promise<void>
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
  const [minCandidates, setMinCandidates] = useState<number | undefined>(60)
  const [maxCandidates, setMaxCandidates] = useState<number | undefined>(200)
  const [category, setCategory] = useState<string>("")
  const { data: categoriesData } = useEvaluationCategories(100)

  const handleGenerate = async () => {
    try {
      const payload: GenerateQueriesRequest = {
        count: queryCount,
        minCandidates,
        maxCandidates,
        category: category || undefined,
      }
      await onGenerate(payload)
      setIsOpen(false)
    } catch (_error) {
      // 에러는 부모에서 처리
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled}>
          <Plus className="h-4 w-4 mr-2" />
          정답셋 자동생성
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>정답셋 자동생성</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="queryCount" className="text-sm font-medium">생성 개수</Label>
              <Input
                id="queryCount"
                type="number"
                value={queryCount}
                onChange={(e) => setQueryCount(Number(e.target.value))}
                min={1}
                max={EVALUATION_CONFIG.MAX_QUERY_COUNT}
                className="text-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">카테고리(선택)</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full text-sm mt-1">
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent className="text-sm">
                  {(categoriesData?.categories || []).map((c) => (
                    <SelectItem key={c.name} value={c.name} className="text-sm">
                      {c.name} ({c.docCount.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="minCandidates" className="text-sm font-medium">최소 후보 수(선택)</Label>
              <Input
                id="minCandidates"
                type="number"
                value={minCandidates ?? ''}
                onChange={(e) => setMinCandidates(e.target.value === '' ? undefined : Number(e.target.value))}
                min={1}
                className="text-sm mt-1"
              />
            </div>
            <div>
              <Label htmlFor="maxCandidates" className="text-sm font-medium">최대 후보 수(선택)</Label>
              <Input
                id="maxCandidates"
                type="number"
                value={maxCandidates ?? ''}
                onChange={(e) => setMaxCandidates(e.target.value === '' ? undefined : Number(e.target.value))}
                min={1}
                className="text-sm mt-1"
              />
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