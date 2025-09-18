import { getPerformanceColor } from "@/utils/evaluation-helpers"

interface PerformanceScoreProps {
  score: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
}

export function PerformanceScore({ 
  score, 
  label, 
  size = 'md',
  showPercentage = true 
}: PerformanceScoreProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg font-bold',
    lg: 'text-2xl font-bold'
  }

  // score가 undefined나 null인 경우 0으로 처리
  const safeScore = score ?? 0

  const formattedScore = showPercentage 
    ? `${(safeScore * 100).toFixed(1)}%`
    : safeScore.toFixed(3)

  return (
    <div className="text-center">
      <div className={`${sizeClasses[size]} ${getPerformanceColor(safeScore)}`}>
        {formattedScore}
      </div>
      {label && (
        <p className="text-sm text-gray-600 mt-1">{label}</p>
      )}
    </div>
  )
} 