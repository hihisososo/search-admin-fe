'use client'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, RefreshCw, Trash2 } from "lucide-react"
import type { DictionaryConfig, BaseDictionaryItem } from '../types/dictionary.types'
import type { DictionaryEnvironmentType } from '@/types/dashboard'

interface DictionaryHeaderProps<T extends BaseDictionaryItem> {
  config: DictionaryConfig<T>
  canEdit: boolean
  environment: DictionaryEnvironmentType
  selectedCount: number
  onEnvironmentChange: (env: DictionaryEnvironmentType) => void
  onAdd: () => void
  onDeleteSelected?: () => void
  onApplyChanges?: (env: DictionaryEnvironmentType) => void
}

export function DictionaryHeader<T extends BaseDictionaryItem>({
  config,
  canEdit,
  environment,
  selectedCount,
  onEnvironmentChange,
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
          {canEdit && (
            <Button
              onClick={onAdd}
              size="sm"
              variant="outline"
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
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              실시간 반영
            </Button>
          )}

          {canEdit && (
            <Button
              onClick={onDeleteSelected}
              size="sm"
              variant="outline"
              disabled={selectedCount === 0}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              선택 삭제{selectedCount > 0 ? ` (${selectedCount})` : ''}
            </Button>
          )}
        </div>
      </div>
      
    </div>
  )
}