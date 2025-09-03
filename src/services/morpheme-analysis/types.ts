// 형태소 분석 API 타입 정의

// 환경 타입
export type AnalysisEnvironment = 'CURRENT' | 'DEV' | 'PROD'

// 토큰 정보
export interface TokenInfo {
  token: string
  type: string  // word, SYNONYM 등
  position: number
  startOffset: number
  endOffset: number
}

// Nori 분석 결과
export interface NoriAnalysis {
  tokens: TokenInfo[]
  formattedTokens: string  // 토큰화된 형태와 동의어 확장 결과
  synonymExpansions?: Record<string, string[]>  // 원본 토큰별 동의어 매핑
}

// 단위 정보
export interface UnitInfo {
  original: string  // 원본 단위 표현
  expanded: string[]  // 확장된 동의어 목록
}

// 형태소 분석 요청
export interface MorphemeAnalysisRequest {
  query: string
  environment: string  // CURRENT, DEV, PROD
}

// 형태소 분석 응답 (서버 응답과 동일)
export interface MorphemeAnalysisResponse {
  environment: string
  originalQuery: string
  noriAnalysis: NoriAnalysis
  units: UnitInfo[]  // 추출된 단위 정보
  models: string[]  // 추출된 모델명
}

// 검색용 쿼리 분석 응답 (API v2 - 2025.01.03)
export interface QueryAnalysisResponse {
  environment: string
  originalQuery: string
  tokens: string[]  // 분석된 원본 토큰 리스트 (동의어 제외)
  mermaidGraph: string  // Mermaid 형식의 토큰 그래프 다이어그램 (동의어 포함)
  queryExpression: string  // 검색식 (AND/OR 조합)
}

// 색인용 쿼리 분석 응답 (API v2 - 2025.01.03)
export interface IndexAnalysisResponse {
  environment: string
  originalQuery: string
  tokens: string[]  // 분석된 원본 토큰 리스트
  additionalTokens: string[]  // 추가 색인어 리스트
}

// 분석 기록
export interface AnalysisRecord {
  id: string
  query: string
  timestamp: string
  result: MorphemeAnalysisResponse
}