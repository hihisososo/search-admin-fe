import { Button } from "@/components/ui/button"
import { RefreshCw, Zap, Trash2 } from "lucide-react"
import { useAsyncTask } from "@/hooks/use-async-task"
import { getTaskProgressText, getTaskCompletionMessage } from "@/utils/evaluation-helpers"
import { QueryGenerationDialog } from "./QueryGenerationDialog"
import { QueryCreateDialog } from "./QueryCreateDialog"
import { useToast } from "@/components/ui/use-toast"
import type { GenerateQueriesRequest } from "@/services/evaluation/types"

interface ActionButtonsProps {
  selectedQueryIds: number[]
  onGenerateQueries: (data: GenerateQueriesRequest) => Promise<{ taskId: number; message: string }>
  onCreateQuery: (text: string) => Promise<void>
  onGenerateCandidates: () => Promise<{ taskId: number; message: string }>
  onEvaluateLlm: () => Promise<{ taskId: number; message: string }>
  onDeleteSelected: () => Promise<void>
  isDeleting: boolean
  compact?: boolean
}

export function ActionButtons({
  selectedQueryIds,
  onGenerateQueries,
  onCreateQuery,
  onGenerateCandidates,
  onEvaluateLlm,
  onDeleteSelected,
  isDeleting,
  compact = false
}: ActionButtonsProps) {
  const { toast } = useToast()
  
  const queryGenTask = useAsyncTask('QUERY_GENERATION', {
    onComplete: (result) => {
      toast({
        title: "쿼리 생성 완료",
        description: getTaskCompletionMessage('QUERY_GENERATION', result),
        variant: "success"
      })
    },
    onError: (error) => {
      toast({
        title: "쿼리 생성 실패",
        description: error,
        variant: "destructive"
      })
    }
  })

  const candidateGenTask = useAsyncTask('CANDIDATE_GENERATION', {
    onComplete: () => {
      toast({
        title: "후보군 생성 완료",
        description: getTaskCompletionMessage('CANDIDATE_GENERATION'),
        variant: "success"
      })
    },
    onError: (error) => {
      toast({
        title: "후보군 생성 실패",
        description: error,
        variant: "destructive"
      })
    }
  })

  const llmEvalTask = useAsyncTask('LLM_EVALUATION', {
    onComplete: () => {
      toast({
        title: "LLM 평가 완료",
        description: getTaskCompletionMessage('LLM_EVALUATION'),
        variant: "success"
      })
    },
    onError: (error) => {
      toast({
        title: "LLM 평가 실패",
        description: error,
        variant: "destructive"
      })
    }
  })

  const handleGenerateQueries = async (data: GenerateQueriesRequest) => {
    const response = await onGenerateQueries(data)
    queryGenTask.startTask(response.taskId)
  }

  const handleGenerateCandidates = async () => {
    if (selectedQueryIds.length === 0) {
      toast({
        title: "선택 필요",
        description: "쿼리를 선택해주세요.",
        variant: "destructive"
      })
      return
    }
    
    const response = await onGenerateCandidates()
    candidateGenTask.startTask((response as any).taskId)
  }

  const handleEvaluateLlm = async () => {
    if (selectedQueryIds.length === 0) {
      toast({
        title: "선택 필요",
        description: "쿼리를 선택해주세요.",
        variant: "destructive"
      })
      return
    }
    
    const response = await onEvaluateLlm()
    llmEvalTask.startTask((response as any).taskId)
  }

  const handleDeleteSelected = async () => {
    if (selectedQueryIds.length === 0) {
      toast({
        title: "선택 필요",
        description: "삭제할 쿼리를 선택해주세요.",
        variant: "destructive"
      })
      return
    }
    
    if (confirm(`선택된 ${selectedQueryIds.length}개 쿼리를 삭제하시겠습니까?`)) {
      await onDeleteSelected()
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <QueryCreateDialog onCreate={onCreateQuery} />
        <QueryGenerationDialog
          onGenerate={handleGenerateQueries}
          isGenerating={false}
          isTaskRunning={queryGenTask.isRunning}
        />
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleGenerateCandidates}
          disabled={candidateGenTask.isRunning || selectedQueryIds.length === 0}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${candidateGenTask.isRunning ? 'animate-spin' : ''}`} />
          {candidateGenTask.isRunning 
            ? getTaskProgressText(candidateGenTask.data, '후보군 자동생성')
            : '후보군 자동생성'
          }
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleEvaluateLlm}
          disabled={llmEvalTask.isRunning || selectedQueryIds.length === 0}
        >
          <Zap className={`h-4 w-4 mr-2 ${llmEvalTask.isRunning ? 'animate-pulse' : ''}`} />
          {llmEvalTask.isRunning 
            ? getTaskProgressText(llmEvalTask.data, '후보군 자동평가')
            : '후보군 자동평가'
          }
        </Button>
        <Button 
          size="sm" 
          variant="destructive"
          onClick={handleDeleteSelected}
          disabled={isDeleting || selectedQueryIds.length === 0}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          선택 삭제
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <QueryCreateDialog onCreate={onCreateQuery} />
        <QueryGenerationDialog
          onGenerate={handleGenerateQueries}
          isGenerating={false}
          isTaskRunning={queryGenTask.isRunning}
        />
      </div>

      <div className="flex items-center gap-2">
      <Button 
        size="sm" 
        variant="outline"
        onClick={handleGenerateCandidates}
        disabled={candidateGenTask.isRunning || selectedQueryIds.length === 0}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${candidateGenTask.isRunning ? 'animate-spin' : ''}`} />
        {candidateGenTask.isRunning 
          ? getTaskProgressText(candidateGenTask.data, '후보군 자동생성')
          : '후보군 자동생성'
        }
      </Button>

      <Button 
        size="sm" 
        variant="outline"
        onClick={handleEvaluateLlm}
        disabled={llmEvalTask.isRunning || selectedQueryIds.length === 0}
      >
        <Zap className={`h-4 w-4 mr-2 ${llmEvalTask.isRunning ? 'animate-pulse' : ''}`} />
        {llmEvalTask.isRunning 
          ? getTaskProgressText(llmEvalTask.data, '후보군 자동평가')
          : '후보군 자동평가'
        }
      </Button>

      <Button 
        size="sm" 
        variant="destructive"
        onClick={handleDeleteSelected}
        disabled={isDeleting || selectedQueryIds.length === 0}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        선택 삭제
      </Button>
      </div>
    </div>
  )
} 