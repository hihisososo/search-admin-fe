'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Search, Plus, RefreshCw, User, Ban, GitBranch, CheckCircle } from "lucide-react"
import type { DictionaryConfig, BaseDictionaryItem } from '../types/dictionary.types'
import type { DictionaryEnvironmentType } from '@/types/dashboard'

interface DictionaryHeaderProps<T extends BaseDictionaryItem> {
  config: DictionaryConfig<T>
  canEdit: boolean
  environment: DictionaryEnvironmentType
  search: string
  onEnvironmentChange: (env: DictionaryEnvironmentType) => void
  onSearchChange: (search: string) => void
  onAdd: () => void
  onApplyChanges?: (env: DictionaryEnvironmentType) => void
}

const getIcon = (iconName: string) => {
  const icons = {
    User: User,
    Ban: Ban,
    GitBranch: GitBranch,
    CheckCircle: CheckCircle
  }
  const Icon = icons[iconName as keyof typeof icons] || User
  return <Icon className="h-5 w-5" />
}

export function DictionaryHeader<T extends BaseDictionaryItem>({
  config,
  canEdit,
  environment,
  search,
  onEnvironmentChange,
  onSearchChange,
  onAdd,
  onApplyChanges
}: DictionaryHeaderProps<T>) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getIcon(config.theme.iconName)}
          <h1 className="text-2xl font-bold">{config.name}</h1>
        </div>
        
        <div className="flex items-center gap-2">
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
        <RadioGroup
          value={environment}
          onValueChange={(value) => onEnvironmentChange(value as DictionaryEnvironmentType)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="CURRENT" id="current" />
            <Label htmlFor="current" className="text-sm cursor-pointer">
              현재 (편집용)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="DEV" id="development" />
            <Label htmlFor="development" className="text-sm cursor-pointer">
              개발
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="PROD" id="production" />
            <Label htmlFor="production" className="text-sm cursor-pointer">
              운영
            </Label>
          </div>
        </RadioGroup>
        
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