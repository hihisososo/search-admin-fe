// 클릭 로그 요청
export interface ClickLogRequest {
  searchKeyword: string
  clickedProductId: string
  indexName: string
}

// 클릭 로그 응답
export interface ClickLogResponse {
  success: boolean
  message: string
  timestamp: string
}