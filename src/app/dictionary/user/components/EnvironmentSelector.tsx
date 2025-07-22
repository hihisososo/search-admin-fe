import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DictionaryEnvironmentType, ENVIRONMENT_LABELS } from "@/types/dashboard"

interface EnvironmentSelectorProps {
  value: DictionaryEnvironmentType
  onChange: (value: DictionaryEnvironmentType) => void
  className?: string
}

export function EnvironmentSelector({ value, onChange, className = "" }: EnvironmentSelectorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium">환경:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(ENVIRONMENT_LABELS).map(([key, info]) => (
            <SelectItem key={key} value={key}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${info.color}`} />
                <span>{info.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Badge variant="outline" className="text-xs">
        {ENVIRONMENT_LABELS[value].description}
      </Badge>
    </div>
  )
} 