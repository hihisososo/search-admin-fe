import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bot, Search, MousePointerClick } from 'lucide-react'

interface AutoEventControllerProps {
  isAutoSearchEnabled: boolean
  setIsAutoSearchEnabled: (value: boolean) => void
  isAutoClickEnabled: boolean
  setIsAutoClickEnabled: (value: boolean) => void
  searchInterval: number
  setSearchInterval: (value: number) => void
  clickInterval: number
  setClickInterval: (value: number) => void
}

export function AutoEventController({
  isAutoSearchEnabled,
  setIsAutoSearchEnabled,
  isAutoClickEnabled,
  setIsAutoClickEnabled,
  searchInterval,
  setSearchInterval,
  clickInterval,
  setClickInterval,
}: AutoEventControllerProps) {
  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bot className="h-4 w-4" />
          자동 이벤트 설정
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 자동 검색 설정 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-search" className="flex items-center gap-2 text-sm">
              <Search className="h-3 w-3" />
              자동 검색
            </Label>
            <Switch
              id="auto-search"
              checked={isAutoSearchEnabled}
              onCheckedChange={setIsAutoSearchEnabled}
            />
          </div>
          {isAutoSearchEnabled && (
            <Select value={String(searchInterval)} onValueChange={(v) => setSearchInterval(Number(v))}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5000">5초마다</SelectItem>
                <SelectItem value="10000">10초마다</SelectItem>
                <SelectItem value="15000">15초마다</SelectItem>
                <SelectItem value="30000">30초마다</SelectItem>
                <SelectItem value="60000">1분마다</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* 자동 클릭 설정 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-click" className="flex items-center gap-2 text-sm">
              <MousePointerClick className="h-3 w-3" />
              자동 클릭
            </Label>
            <Switch
              id="auto-click"
              checked={isAutoClickEnabled}
              onCheckedChange={setIsAutoClickEnabled}
            />
          </div>
          {isAutoClickEnabled && (
            <Select value={String(clickInterval)} onValueChange={(v) => setClickInterval(Number(v))}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3000">3초마다</SelectItem>
                <SelectItem value="5000">5초마다</SelectItem>
                <SelectItem value="10000">10초마다</SelectItem>
                <SelectItem value="15000">15초마다</SelectItem>
                <SelectItem value="30000">30초마다</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardContent>
    </Card>
  )
}