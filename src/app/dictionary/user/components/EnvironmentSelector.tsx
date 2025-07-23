import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DictionaryEnvironmentType, ENVIRONMENT_LABELS } from "@/types/dashboard"

interface EnvironmentSelectorProps {
  value: DictionaryEnvironmentType
  onChange: (value: DictionaryEnvironmentType) => void
  className?: string
}

export function EnvironmentSelector({ value, onChange, className = "" }: EnvironmentSelectorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs font-medium text-gray-600">환경:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(ENVIRONMENT_LABELS).map(([key, info]) => (
            <SelectItem key={key} value={key} className="text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${info.color}`} />
                <span>{info.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 