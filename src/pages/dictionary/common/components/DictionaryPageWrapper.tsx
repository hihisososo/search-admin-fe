'use client'

import { DictionaryPage } from './DictionaryPage'
import type { DictionaryType } from '../types/dictionary.types'

interface DictionaryPageWrapperProps {
  type: DictionaryType
}

export function DictionaryPageWrapper({ type }: DictionaryPageWrapperProps) {
  return <DictionaryPage type={type} />
}