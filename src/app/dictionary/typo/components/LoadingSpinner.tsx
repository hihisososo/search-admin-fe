import React from 'react'

export const LoadingSpinner = React.memo(() => (
  <div className="text-center py-6">
    <div className="inline-flex items-center gap-2 text-sm text-gray-600">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
      로딩 중...
    </div>
  </div>
))