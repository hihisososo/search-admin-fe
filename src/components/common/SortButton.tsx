import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

interface SortButtonProps {
  label: string
  field: string
  currentSortField?: string
  sortDirection?: "asc" | "desc"
  onSort: (field: string) => void
  className?: string
}

export function SortButton({
  label,
  field,
  currentSortField,
  sortDirection = "asc",
  onSort,
  className = ""
}: SortButtonProps) {
  const isActive = currentSortField === field

  const renderIcon = () => {
    if (!isActive) {
      return <ArrowUpDown className="h-3 w-3 opacity-30" />
    }
    return sortDirection === "asc" ? 
      <ArrowUp className="h-3 w-3 text-gray-600" /> : 
      <ArrowDown className="h-3 w-3 text-gray-600" />
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onSort(field)}
      className={`h-auto p-0 font-semibold hover:bg-gray-100 ${className}`}
    >
      <div className="flex items-center gap-1">
        {label}
        {renderIcon()}
      </div>
    </Button>
  )
}