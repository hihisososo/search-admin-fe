import React from 'react'
import { TYPO_CONSTANTS } from '../constants'

interface EmptyStateProps {
  hasError: boolean
}

export const EmptyState = React.memo(({ hasError }: EmptyStateProps) => (
  <div className="text-center py-6 text-gray-500">
    {hasError ? (
      <div>
        <div className="mb-2 text-sm">{TYPO_CONSTANTS.VALIDATION.SERVER_ERROR_TITLE}</div>
        <div className="text-xs text-gray-400">
          {TYPO_CONSTANTS.VALIDATION.SERVER_ERROR_HINT}
          <br />
          {TYPO_CONSTANTS.VALIDATION.API_VERSION_HINT}
        </div>
      </div>
    ) : (
      <div>
        <div className="mb-2 text-sm">{TYPO_CONSTANTS.VALIDATION.EMPTY_ERROR}</div>
        <div className="text-xs text-gray-400">{TYPO_CONSTANTS.VALIDATION.EMPTY_HINT}</div>
      </div>
    )}
  </div>
))