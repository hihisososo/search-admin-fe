import { memo } from 'react'

export const EmptyState = memo(() => (
  <div className="text-center py-6 text-gray-500">
    <div className="mb-2 text-sm">등록된 항목이 없습니다</div>
    <div className="text-xs text-gray-400">새로운 사용자 단어를 추가해보세요</div>
  </div>
))

EmptyState.displayName = 'EmptyState'