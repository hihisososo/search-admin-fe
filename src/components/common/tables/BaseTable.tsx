import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { renderSortIcon } from "@/utils/table-helpers"

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (item: T) => React.ReactNode
  headerRender?: () => React.ReactNode
}

interface BaseTableProps<T> {
  columns: Column<T>[]
  data: T[]
  sortField?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (field: any) => void
  onRowClick?: (item: T) => void
  loading?: boolean
  emptyMessage?: string
  showEmptyTable?: boolean
  keyExtractor: (item: T) => string | number
  className?: string
  highlightedId?: string | number | null
}

export function BaseTable<T>({
  columns,
  data,
  sortField,
  sortDirection,
  onSort,
  onRowClick,
  loading,
  emptyMessage = '데이터가 없습니다.',
  showEmptyTable = false,
  keyExtractor,
  className = '',
  highlightedId
}: BaseTableProps<T>) {
  const handleHeaderClick = (column: Column<T>) => {
    if (column.sortable && onSort) {
      onSort(column.key)
    }
  }

  const getCellAlignment = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      default:
        return 'text-left'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  if (data.length === 0 && !showEmptyTable) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">{emptyMessage}</div>
      </div>
    )
  }

  return (
    <div className={`border rounded-lg overflow-x-auto ${className}`}>
      <Table className="min-w-full">
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={`py-2 text-xs font-semibold text-gray-700 ${getCellAlignment(column.align)} ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                } ${column.width || ''}`}
                onClick={() => handleHeaderClick(column)}
              >
                {column.headerRender ? (
                  column.headerRender()
                ) : (
                  <div className={`flex items-center gap-1 ${column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : ''}`}>
                    {column.label}
                    {column.sortable && sortField && sortDirection && renderSortIcon(column.key, sortField, sortDirection)}
                  </div>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => {
            const itemKey = keyExtractor(item)
            const isHighlighted = highlightedId !== null && highlightedId === itemKey
            
            return (
              <TableRow
                key={itemKey}
                className={`
                  hover:bg-gray-50 transition-colors
                  ${onRowClick ? 'cursor-pointer' : ''}
                  ${isHighlighted ? 'bg-yellow-50 animate-pulse' : ''}
                `}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <TableCell
                    key={`${itemKey}-${column.key}`}
                    className={`py-2 px-3 text-xs ${getCellAlignment(column.align)}`}
                  >
                    {column.render
                      ? column.render(item)
                      : (item as any)[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            )
          }))}
        </TableBody>
      </Table>
    </div>
  )
}