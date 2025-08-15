import { Button } from "@/components/ui/button"
import { useState } from "react"
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
  const [llmStarting, setLlmStarting] = useState(false)
  const [queryStarting, setQueryStarting] = useState(false)
  const [candStarting, setCandStarting] = useState(false)
  
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
    try {
      setQueryStarting(true)
      toast({
        title: '정답셋 자동생성 시작',
        description: '백그라운드에서 쿼리 생성 중입니다.',
        variant: 'default'
      })
      const response = await onGenerateQueries(data)
      queryGenTask.startTask(response.taskId)
    } catch (error) {
      toast({
        title: '정답셋 자동생성 시작 실패',
        description: error instanceof Error ? error.message : '요청 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
    } finally {
      setQueryStarting(false)
    }
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
    
    try {
      setCandStarting(true)
      toast({
        title: '후보군 생성 시작',
        description: '백그라운드에서 후보군을 생성합니다.',
        variant: 'default'
      })
      const response = await onGenerateCandidates()
      candidateGenTask.startTask((response as any).taskId)
    } catch (error) {
      toast({
        title: '후보군 생성 시작 실패',
        description: error instanceof Error ? error.message : '요청 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
    } finally {
      setCandStarting(false)
    }
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
    
    try {
      setLlmStarting(true)
      toast({
        title: "자동평가 시작",
        description: "LLM 자동평가를 시작했습니다. 진행률은 버튼에 표시됩니다.",
        variant: "default"
      })
      const response = await onEvaluateLlm()
      llmEvalTask.startTask((response as any).taskId)
    } catch (error) {
      toast({
        title: "자동평가 시작 실패",
        description: error instanceof Error ? error.message : '요청 중 오류가 발생했습니다.',
        variant: "destructive"
      })
    } finally {
      setLlmStarting(false)
    }
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
      <div className="flex w-full justify-end items-center gap-2">
        {/* 4. 정답셋 자동생성 - 맨 왼쪽, 파란색 */}
        <div className={queryGenTask.isRunning ? 'relative overflow-hidden' : ''}>
          <span className={`absolute inset-0 ${queryGenTask.isRunning ? 'bg-gradient-to-r from-transparent via-blue-100/60 to-transparent animate-[shimmer_1.5s_linear_infinite] rounded-md' : ''}`} />
          <QueryGenerationDialog
            onGenerate={handleGenerateQueries}
            isGenerating={queryStarting}
            isTaskRunning={queryGenTask.isRunning}
            progressText={queryGenTask.isRunning ? getTaskProgressText(queryGenTask.data, '정답셋 자동생성') : undefined}
          />
        </div>
        {/* 1. 쿼리 추가 - 흰색 */}
        <QueryCreateDialog onCreate={onCreateQuery} />
        {/* 2. 후보군 생성 */}
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleGenerateCandidates}
          disabled={candidateGenTask.isRunning || selectedQueryIds.length === 0}
          className={candidateGenTask.isRunning ? 'relative overflow-hidden' : ''}
        >
          <span className={`pointer-events-none absolute inset-0 ${candidateGenTask.isRunning ? 'bg-gradient-to-r from-transparent via-blue-100/60 to-transparent animate-[shimmer_1.5s_linear_infinite]' : ''}`} />
          <RefreshCw className={`h-4 w-4 mr-1 ${(candStarting || candidateGenTask.isRunning) ? 'animate-spin' : ''}`} />
          {candStarting
            ? '시작중...'
            : candidateGenTask.isRunning 
              ? getTaskProgressText(candidateGenTask.data, '후보군 생성')
            : '후보군 생성'
          }
        </Button>
        {/* 3. 후보군 자동평가 */}
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleEvaluateLlm}
          disabled={llmEvalTask.isRunning || selectedQueryIds.length === 0}
          className={llmEvalTask.isRunning ? 'relative overflow-hidden' : ''}
        >
          <span className={`pointer-events-none absolute inset-0 ${llmEvalTask.isRunning ? 'bg-gradient-to-r from-transparent via-amber-100/60 to-transparent animate-[shimmer_1.5s_linear_infinite]' : ''}`} />
          <Zap className={`h-4 w-4 mr-1 ${(llmStarting || llmEvalTask.isRunning) ? 'animate-pulse' : ''}`} />
          {llmStarting
            ? '시작중...'
            : llmEvalTask.isRunning 
              ? getTaskProgressText(llmEvalTask.data, '후보군 자동평가')
            : '후보군 자동평가'
          }
        </Button>
        
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleDeleteSelected}
          disabled={isDeleting || selectedQueryIds.length === 0}
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          선택 삭제
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-end w-full">
      <div className="flex items-center gap-2">
        {/* 4. 정답셋 자동생성 - 맨 왼쪽, 파란색 */}
        <QueryGenerationDialog
          onGenerate={handleGenerateQueries}
          isGenerating={queryStarting}
          isTaskRunning={queryGenTask.isRunning}
          progressText={queryGenTask.isRunning ? getTaskProgressText(queryGenTask.data, '정답셋 자동생성') : undefined}
        />
        {/* 1. 쿼리 추가 - 흰색 */}
        <QueryCreateDialog onCreate={onCreateQuery} />
        {/* 2. 후보군 생성 */}
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleGenerateCandidates}
          disabled={candidateGenTask.isRunning || selectedQueryIds.length === 0}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${candidateGenTask.isRunning ? 'animate-spin' : ''}`} />
          {candidateGenTask.isRunning 
            ? getTaskProgressText(candidateGenTask.data, '후보군 생성')
            : '후보군 생성'
          }
        </Button>
        {/* 3. 후보군 자동평가 */}
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleEvaluateLlm}
          disabled={llmEvalTask.isRunning || selectedQueryIds.length === 0}
        >
          <Zap className={`h-4 w-4 mr-2 ${(llmStarting || llmEvalTask.isRunning) ? 'animate-pulse' : ''}`} />
          {llmStarting
            ? '시작중...'
            : llmEvalTask.isRunning 
              ? getTaskProgressText(llmEvalTask.data, '후보군 자동평가')
            : '후보군 자동평가'
          }
        </Button>
        {/* 4. 정답셋 자동생성 */}
        <div className={queryGenTask.isRunning ? 'relative overflow-hidden' : ''}>
          <span className={`absolute inset-0 ${queryGenTask.isRunning ? 'bg-gradient-to-r from-transparent via-blue-100/60 to-transparent animate-[shimmer_1.5s_linear_infinite] rounded-md' : ''}`} />
          <QueryGenerationDialog
            onGenerate={handleGenerateQueries}
            isGenerating={false}
            isTaskRunning={queryGenTask.isRunning}
          />
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleDeleteSelected}
          disabled={isDeleting || selectedQueryIds.length === 0}
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          선택 삭제
        </Button>
      </div>
    </div>
  )
} 