export type AnalysisEnvironment = 'CURRENT' | 'DEV' | 'PROD'

export interface QueryAnalysisRequest {
  query: string
  environment: AnalysisEnvironment
}

export interface Token {
  token: string
  type: string
  position: number
  startOffset: number
  endOffset: number
}

export interface NoriAnalysis {
  tokens: Token[]
  synonymExpansions: Record<string, string[]>
}

export interface Unit {
  original: string
  expanded: string[]
}

export interface QueryAnalysisResponse {
  environment: AnalysisEnvironment
  originalQuery: string
  noriAnalysis: NoriAnalysis
  units: Unit[]
  models: string[]
}

export interface RefreshIndexResponse {
  status: string
  message: string
  indexName: string
}