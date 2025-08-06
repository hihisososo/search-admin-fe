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
      <span className="text-sm font-medium text-gray-700">환경선택</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[150px] h-9 text-sm border-gray-300 hover:border-gray-400 focus:border-blue-500 transition-colors">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="shadow-lg border-gray-200">
          {Object.entries(ENVIRONMENT_LABELS).map(([key, info]) => (
            <SelectItem key={key} value={key} className="text-sm hover:bg-gray-50">
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full ${info.color} shadow-sm`} />
                <span className="font-medium">{info.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 