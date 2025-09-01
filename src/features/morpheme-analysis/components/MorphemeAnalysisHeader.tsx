'use client'

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Trash2 } from "lucide-react"
import type { AnalysisEnvironment } from '@/services/morpheme-analysis/types'

interface MorphemeAnalysisHeaderProps {
  environment: AnalysisEnvironment
  onEnvironmentChange: (env: AnalysisEnvironment) => void
  onRefreshIndex: () => void
  refreshing: boolean
  recordCount: number
  onClearRecords: () => void
}

export function MorphemeAnalysisHeader({
  environment,
  onEnvironmentChange,
  onRefreshIndex,
  refreshing,
  recordCount,
  onClearRecords
}: MorphemeAnalysisHeaderProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">환경선택</span>
          <Select value={environment} onValueChange={(value) => onEnvironmentChange(value as AnalysisEnvironment)}>
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
          {/* CURRENT 환경일 때만 임시 인덱스 갱신 버튼 표시 */}
          {environment === 'CURRENT' && (
            <Button
              onClick={onRefreshIndex}
              disabled={refreshing}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              사전 최신화
            </Button>
          )}
          
          {/* 기록 삭제 버튼 */}
          {recordCount > 0 && (
            <Button
              onClick={onClearRecords}
              size="sm"
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              전체 삭제 ({recordCount})
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}