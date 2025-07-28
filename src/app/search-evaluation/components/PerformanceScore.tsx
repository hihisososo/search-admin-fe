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

  const formattedScore = showPercentage 
    ? `${(score * 100).toFixed(1)}%`
    : score.toFixed(3)

  return (
    <div className="text-center">
      <div className={`${sizeClasses[size]} ${getPerformanceColor(score)}`}>
        {formattedScore}
      </div>
      {label && (
        <p className="text-sm text-gray-600 mt-1">{label}</p>
      )}
    </div>
  )
} 