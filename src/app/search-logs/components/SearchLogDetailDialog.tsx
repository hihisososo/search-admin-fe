import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { searchLogApi } from "@/lib/api"
import type { SearchLogResponse } from "@/services/search-logs/types"
import { BarChart3 } from "lucide-react"

interface SearchLogDetailDialogProps {
  logId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchLogDetailDialog({ logId, open, onOpenChange }: SearchLogDetailDialogProps) {
  const [data, setData] = useState<SearchLogResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const fetchDetail = async () => {
      if (!open || !logId) return
      setLoading(true)
      setError("")
      try {
        const res = await searchLogApi.getDetail(logId)
        setData(res)
      } catch (e) {
        setError(e instanceof Error ? e.message : "상세 조회 중 오류가 발생했습니다.")
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [open, logId])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  }

  const getStatusText = (isError: boolean) => (isError ? '에러' : '정상')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            로그 상세
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="text-xs text-gray-600">로딩 중...</div>
        ) : error ? (
          <div className="text-xs text-red-600">{error}</div>
        ) : data ? (
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="w-28 shrink-0 text-gray-600">검색시간</span>
              <span className="flex-1 break-all text-gray-900">{formatTimestamp(data.timestamp)}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-28 shrink-0 text-gray-600">검색키워드</span>
              <span className="flex-1 break-all text-gray-900">{data.searchKeyword}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-28 shrink-0 text-gray-600">응답시간</span>
              <span className="flex-1 break-all text-gray-900">{data.responseTimeMs}ms</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-28 shrink-0 text-gray-600">결과수</span>
              <span className="flex-1 break-all text-gray-900">{data.resultCount.toLocaleString('ko-KR')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-28 shrink-0 text-gray-600">클라이언트 IP</span>
              <span className="flex-1 break-all text-gray-900">{data.clientIp}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-28 shrink-0 text-gray-600">세션 ID</span>
              <span className="flex-1 break-all text-gray-900">{data.searchSessionId || '-'}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-28 shrink-0 text-gray-600">상태</span>
              <span className="flex-1 break-all text-gray-900">{getStatusText(data.isError)}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-28 shrink-0 text-gray-600">인덱스</span>
              <span className="flex-1 break-all text-gray-900">{data.indexName}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-28 shrink-0 text-gray-600">User-Agent</span>
              <span className="flex-1 break-all text-gray-900">{data.userAgent}</span>
            </div>
            {data.isError && data.errorMessage && (
              <div className="flex items-start gap-2">
                <span className="w-28 shrink-0 text-gray-600">에러 메시지</span>
                <span className="flex-1 break-all text-gray-900">{data.errorMessage}</span>
              </div>
            )}
            {data.searchParams && (
              <div className="flex items-start gap-2">
                <span className="w-28 shrink-0 text-gray-600">검색 파라미터</span>
                <span className="flex-1 break-all text-gray-900">{JSON.stringify(data.searchParams)}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-600">데이터가 없습니다.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}


