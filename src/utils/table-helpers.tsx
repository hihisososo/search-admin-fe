import { ArrowUpDown, ArrowUp, ArrowDown, ChevronUp, ChevronDown } from 'lucide-react'

export type SortDirection = 'asc' | 'desc'

export const getSortIcon = (field: string, sortField: string, sortDirection: SortDirection, variant: 'arrow' | 'chevron' = 'arrow') => {
  const iconSize = variant === 'arrow' ? 'h-3.5 w-3.5' : 'h-3 w-3'
  
  if (sortField !== field) {
    return variant === 'arrow' 
      ? <ArrowUpDown className={iconSize} />
      : <ChevronUp className={`${iconSize} opacity-30`} />
  }
  
  if (variant === 'arrow') {
    return sortDirection === 'asc' 
      ? <ArrowUp className={iconSize} /> 
      : <ArrowDown className={iconSize} />
  } else {
    return sortDirection === 'asc' 
      ? <ChevronUp className={iconSize} /> 
      : <ChevronDown className={iconSize} />
  }
}

export const renderSortIcon = (field: string, sortField: string, sortDirection: SortDirection) => {
  return getSortIcon(field, sortField, sortDirection, 'chevron')
}

export const formatResponseTime = (ms: number) => {
  if (ms < 1000) {
    return `${ms}ms`
  }
  return `${(ms / 1000).toFixed(2)}s`
}

export const formatResultCount = (count: number) => {
  return count.toLocaleString('ko-KR')
}

export const truncateText = (text: string, maxLength: number = 30) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export const getResponseTimeColor = (ms: number) => {
  if (ms < 100) return "text-green-600"
  if (ms < 500) return "text-yellow-600" 
  if (ms < 1000) return "text-orange-600"
  return "text-red-600"
}