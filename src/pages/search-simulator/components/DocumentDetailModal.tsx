import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle } from 'lucide-react'
import { searchSimulatorService } from '@/services/search-simulator/api'

interface DocumentDetailModalProps {
  documentId: string | null
  environment: string
  isOpen: boolean
  onClose: () => void
}

export function DocumentDetailModal({ 
  documentId, 
  environment, 
  isOpen, 
  onClose 
}: DocumentDetailModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [documentData, setDocumentData] = useState<any>(null)

  useEffect(() => {
    if (isOpen && documentId) {
      fetchDocument()
    }
  }, [isOpen, documentId, environment])

  const fetchDocument = async () => {
    if (!documentId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const data = await searchSimulatorService.getDocument(documentId, environment)
      // 벡터 필드 제외
      const filteredData = Object.keys(data).reduce((acc, key) => {
        if (!key.includes('vector') && !key.includes('embedding')) {
          acc[key] = data[key]
        }
        return acc
      }, {} as any)
      setDocumentData(filteredData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '문서 조회 실패')
    } finally {
      setLoading(false)
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[90vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Badge variant="outline" className="font-mono text-sm px-2 py-1">
              문서 ID: {documentId || 'N/A'}
            </Badge>
            <span className="text-gray-700 font-medium">
              Elasticsearch 문서 상세
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {documentData && !loading && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-3">
                📄 Elasticsearch Document (벡터 필드 제외)
              </div>
              <pre className="text-xs overflow-auto whitespace-pre-wrap font-mono text-gray-700 max-h-[60vh] border bg-white p-3 rounded">
                {JSON.stringify(documentData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}