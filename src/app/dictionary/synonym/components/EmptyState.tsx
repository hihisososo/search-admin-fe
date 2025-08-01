import React from 'react'
import { SYNONYM_CONSTANTS } from '../constants'

export const EmptyState = React.memo(() => (
  <div className="text-center py-6 text-gray-500">
    <div className="mb-2 text-sm">{SYNONYM_CONSTANTS.VALIDATION.EMPTY_ERROR}</div>
    <div className="text-xs text-gray-400">{SYNONYM_CONSTANTS.VALIDATION.EMPTY_HINT}</div>
  </div>
))