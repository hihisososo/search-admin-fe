'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, RefreshCw, Trash2 } from "lucide-react"
import type { DictionaryConfig, BaseDictionaryItem } from '../types/dictionary.types'
import type { DictionaryEnvironmentType } from '@/types/dashboard'

interface DictionaryHeaderProps<T extends BaseDictionaryItem> {
  config: DictionaryConfig<T>
  canEdit: boolean
  environment: DictionaryEnvironmentType
  search: string
  selectedCount: number
  onEnvironmentChange: (env: DictionaryEnvironmentType) => void
  onSearchChange: (search: string) => void
  onAdd: () => void
  onDeleteSelected?: () => void
  onApplyChanges?: (env: DictionaryEnvironmentType) => void
}

export function DictionaryHeader<T extends BaseDictionaryItem>({
  config,
  canEdit,
  environment,
  search,
  selectedCount,
  onEnvironmentChange,
  onSearchChange,
  onAdd,
  onDeleteSelected,
  onApplyChanges
}: DictionaryHeaderProps<T>) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">환경선택</span>
          <Select value={environment} onValueChange={(value) => onEnvironmentChange(value as DictionaryEnvironmentType)}>
            <SelectTrigger className="w-[150px] h-9 text-sm border-gray-300 hover:border-gray-400 focus:border-blue-500 transition-colors">
              <SelectValue placeholder="환경 선택" />
            </SelectTrigger>
            <SelectContent className="shadow-lg border-gray-200">
              <SelectItem value="CURRENT" className="text-sm hover:bg-gray-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" />
                  <span className="font-medium">현재 (편집용)</span>
                </div>
              </SelectItem>
              <SelectItem value="DEV" className="text-sm hover:bg-gray-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm" />
                  <span className="font-medium">개발</span>
                </div>
              </SelectItem>
              <SelectItem value="PROD" className="text-sm hover:bg-gray-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-gray-800 shadow-sm" />
                  <span className="font-medium">운영</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          {canEdit && selectedCount > 0 && (
            <Button
              onClick={onDeleteSelected}
              size="sm"
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              선택 삭제 ({selectedCount})
            </Button>
          )}
          
          {canEdit && (
            <Button
              onClick={onAdd}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          )}
          
          {config.features.realtimeSync && onApplyChanges && (
            <Button
              onClick={() => onApplyChanges(environment)}
              size="sm"
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              실시간 반영
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="검색어를 입력하세요"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
        </div>
      </div>
    </div>
  )
}