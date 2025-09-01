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

// 쿼리 분석 응답 (MorphemeAnalysisResponse와 동일)
export type QueryAnalysisResponse = MorphemeAnalysisResponse

// 분석 기록
export interface AnalysisRecord {
  id: string
  query: string
  timestamp: string
  result: MorphemeAnalysisResponse
}