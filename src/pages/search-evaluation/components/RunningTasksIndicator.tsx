import { useRunningTasks } from "../hooks/use-evaluation"
import { TASK_STATUS_LABELS, TASK_TYPE_LABELS } from "../constants"

interface RunningTasksIndicatorProps {
  className?: string
}

export function RunningTasksIndicator({ className = "" }: RunningTasksIndicatorProps) {
  const running = useRunningTasks()

  const tasks = running.data || []
  if (tasks.length === 0) return null

  return (
    <div className={`sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border rounded-md p-2 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-gray-700">실행 중 작업 {tasks.length}개</div>
      </div>
      <div className="mt-2 space-y-1">
        {tasks.map((t) => {
          const percent = Math.max(0, Math.min(100, Math.round(t.progress || 0)))
          const typeLabel = (TASK_TYPE_LABELS as any)[t.taskType] || t.taskType
          const statusLabel = (TASK_STATUS_LABELS as any)[t.status] || t.status
          return (
            <div key={t.id} className="border rounded px-2 py-1">
              <div className="flex items-center justify-between text-[11px] text-gray-700">
                <div className="truncate mr-2">#{t.id} · {typeLabel}</div>
                <div className="text-gray-500">{statusLabel}</div>
              </div>
              <div className="mt-1 h-1.5 bg-gray-100 rounded overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${percent}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


