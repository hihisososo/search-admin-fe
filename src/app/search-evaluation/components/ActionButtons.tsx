import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Zap, Trash2 } from "lucide-react"
import { useAsyncTask } from "@/hooks/use-async-task"
import { getTaskProgressText, getTaskCompletionMessage } from "@/utils/evaluation-helpers"
import { QueryGenerationDialog } from "./QueryGenerationDialog"

interface ActionButtonsProps {
  selectedQueryIds: number[]
  onGenerateQueries: (count: number) => Promise<{ taskId: number; message: string }>
  onGenerateCandidates: () => Promise<{ taskId: number; message: string }>
  onEvaluateLlm: () => Promise<{ taskId: number; message: string }>
  onDeleteSelected: () => Promise<void>
  isDeleting: boolean
}

export function ActionButtons({
  selectedQueryIds,
  onGenerateQueries,
  onGenerateCandidates,
  onEvaluateLlm,
  onDeleteSelected,
  isDeleting
}: ActionButtonsProps) {
  const queryGenTask = useAsyncTask('QUERY_GENERATION', {
    onComplete: (result) => {
      alert(getTaskCompletionMessage('QUERY_GENERATION', result))
    },
    onError: (error) => {
      alert(`❌ 쿼리 생성 실패: ${error}`)
    }
  })

  const candidateGenTask = useAsyncTask('CANDIDATE_GENERATION', {
    onComplete: () => {
      alert(getTaskCompletionMessage('CANDIDATE_GENERATION'))
    },
    onError: (error) => {
      alert(`❌ 후보군 생성 실패: ${error}`)
    }
  })

  const llmEvalTask = useAsyncTask('LLM_EVALUATION', {
    onComplete: () => {
      alert(getTaskCompletionMessage('LLM_EVALUATION'))
    },
    onError: (error) => {
      alert(`❌ LLM 평가 실패: ${error}`)
    }
  })

  const handleGenerateQueries = async (count: number) => {
    const response = await onGenerateQueries(count)
    queryGenTask.startTask(response.taskId)
  }

  const handleGenerateCandidates = async () => {
    if (selectedQueryIds.length === 0) {
      alert('쿼리를 선택해주세요.')
      return
    }
    
    const response = await onGenerateCandidates()
    candidateGenTask.startTask((response as any).taskId)
  }

  const handleEvaluateLlm = async () => {
    if (selectedQueryIds.length === 0) {
      alert('쿼리를 선택해주세요.')
      return
    }
    
    const response = await onEvaluateLlm()
    llmEvalTask.startTask((response as any).taskId)
  }

  const handleDeleteSelected = async () => {
    if (selectedQueryIds.length === 0) {
      alert('삭제할 쿼리를 선택해주세요.')
      return
    }
    
    if (confirm(`선택된 ${selectedQueryIds.length}개 쿼리를 삭제하시겠습니까?`)) {
      await onDeleteSelected()
    }
  }

  return (
    <div className="flex flex-wrap gap-2 p-3 rounded-lg">
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