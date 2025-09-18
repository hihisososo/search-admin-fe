import type { TooltipProps } from 'recharts'
import { formatChartDate } from '@/utils/chart-helpers'

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
  }>
  label?: string
}

export const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-xs">
      <p className="font-medium text-gray-700 mb-1">{label && formatChartDate(label)}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-gray-600" style={{ color: entry.color }}>
          {entry.name}: {
            String(entry.name).includes('시간')
              ? `${entry.value}ms`
              : Number(entry.value).toLocaleString()
          }
        </p>
      ))}
    </div>
  )
}