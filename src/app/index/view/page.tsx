import { useNavigate, useParams } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { Play } from "lucide-react"

const STEPS = [
  { key: "indexInfo", label: "기본정보" },
  { key: "data", label: "데이터 업로드" },
  { key: "mapping", label: "매핑" },
  { key: "settings", label: "세팅" },
]

interface IndexDetail {
  id: number
  name: string
  description?: string
  status: string
  docCount: number
  size: number
  lastIndexedAt: string
  fileName?: string
  mappings?: {
    properties: Record<string, any>
  }
  settings?: {
    number_of_shards: number
    number_of_replicas: number
  }
}

export default function IndexView() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState("")
  const [indexDetail, setIndexDetail] = useState<IndexDetail | null>(null)
  
  // 수정 가능한 필드들
  const [description, setDescription] = useState("")
  const [mappingValue, setMappingValue] = useState("")
  const [settingsValue, setSettingsValue] = useState("")
  const [jsonFile, setJsonFile] = useState<File | null>(null)

  const fetchIndexDetail = async () => {
    if (!id) return
    
    setLoading(true)
    setError("")
    try {
      const response = await apiFetch<IndexDetail>(`/api/v1/indexes/${id}`)
      setIndexDetail(response)
      
      // 폼 필드 초기화
      setDescription(response.description || "")
      setMappingValue(JSON.stringify(response.mappings || {}, null, 2))
      setSettingsValue(JSON.stringify(response.settings || {}, null, 2))
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "상세 조회 실패")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!id) return
    
    setSaving(true)
    setError("")
    try {
      // Multipart 방식으로 전송
      const formData = new FormData()
      const dto = {
        description: description.trim() || undefined
      }
      
      formData.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }))
      
      if (jsonFile) {
        formData.append('file', jsonFile)
      }
      
      const response = await apiFetch<IndexDetail>(`/api/v1/indexes/${id}`, {
        method: 'PUT',
        body: formData,
      })
      
      if (jsonFile) {
        alert(`색인이 성공적으로 업데이트되었습니다!\n상태: ${response.status}`)
      } else {
        alert(`색인 설정이 성공적으로 업데이트되었습니다!\n상태: ${response.status}`)
      }
      
      // 저장 후 최신 정보 다시 조회
      setJsonFile(null)
      await fetchIndexDetail()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패")
    } finally {
      setSaving(false)
    }
  }

  const handleRunIndex = async () => {
    if (!id) return
    
    if (!confirm("색인을 실행하시겠습니까?")) return
    
    setRunning(true)
    try {
      await apiFetch(`/api/v1/indexes/${id}/run`, { method: 'POST' })
      alert("색인이 성공적으로 실행되었습니다.")
      
      // 실행 후 최신 정보 다시 조회
      await fetchIndexDetail()
      
    } catch (err) {
      alert(err instanceof Error ? err.message : "색인 실행 실패")
    } finally {
      setRunning(false)
    }
  }

  const handleDownload = async () => {
    if (!id) return
    
    try {
      const response = await apiFetch<{presignedUrl: string}>(`/api/v1/indexes/${id}/download`)
      const link = document.createElement('a')
      link.href = response.presignedUrl
      link.click()
    } catch (err) {
      alert(err instanceof Error ? err.message : "다운로드 실패")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      
      // 파일 크기 체크 (50MB 제한)
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxSize) {
        setError("파일 크기는 50MB를 초과할 수 없습니다.")
        return
      }
      
      // 파일 타입 체크
      if (!file.type.includes('json') && !file.name.endsWith('.json')) {
        setError("JSON 파일만 업로드 가능합니다.")
        return
      }
      
      setJsonFile(file)
      setError("")
    } else {
      setJsonFile(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const currentStepKey = STEPS[step].key
  const handleTabChange = (value: string) => {
    const idx = STEPS.findIndex(s => s.key === value)
    if (idx !== -1) setStep(idx)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      INDEXED: { text: "색인완료", className: "bg-green-100 text-green-800" },
      INDEXING: { text: "색인중", className: "bg-blue-100 text-blue-800" },
      CREATED: { text: "생성완료", className: "bg-yellow-100 text-yellow-800" },
      CREATING: { text: "생성중", className: "bg-orange-100 text-orange-800" },
      FAILED: { text: "실패", className: "bg-red-100 text-red-800" },
    }
    const config = statusMap[status] || { text: status, className: "bg-gray-100 text-gray-800" }
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.text}
      </span>
    )
  }

  useEffect(() => {
    fetchIndexDetail()
  }, [id])

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            색인 상세 정보 로딩 중...
          </div>
        </div>
      </div>
    )
  }

  if (!indexDetail) {
    return (
      <div className="w-full p-6">
        <div className="text-center py-8 text-red-600">색인을 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">색인 상세</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRunIndex} 
              disabled={running || indexDetail.status === 'INDEXING' || indexDetail.status === 'CREATING'}
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              title={running ? '색인 진행 중...' : indexDetail.status === 'INDEXING' ? '색인 진행 중...' : indexDetail.status === 'CREATING' ? '색인 생성 중...' : '색인 실행'}
            >
              {running ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div> : <Play className="h-4 w-4 mr-2" />}
              {running ? "색인 중..." : "색인 실행"}
            </Button>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/index')}>목록으로</Button>
      </div>

      {error && (
        <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <Tabs value={currentStepKey} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full">
          {STEPS.map((s) => (
            <TabsTrigger key={s.key} value={s.key} className="w-full">
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="indexInfo" className="w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>기본정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>색인 이름</Label>
                  <Input value={indexDetail.name} readOnly disabled className="bg-muted" />
                </div>
                <div>
                  <Label>설명</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="색인에 대한 설명을 입력하세요 (선택사항)"
                    maxLength={500}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    최대 500자까지 입력할 수 있습니다.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>상태</Label>
                    <div className="flex items-center h-9 px-3 py-1 rounded-md border bg-muted">
                      {getStatusBadge(indexDetail.status)}
                    </div>
                  </div>
                  <div>
                    <Label>파일명</Label>
                    <Input value={indexDetail.fileName || '-'} readOnly disabled className="bg-muted" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>문서 수</Label>
                    <Input value={indexDetail.docCount.toLocaleString()} readOnly disabled className="bg-muted" />
                  </div>
                  <div>
                    <Label>크기</Label>
                    <Input value={formatSize(indexDetail.size)} readOnly disabled className="bg-muted" />
                  </div>
                  <div>
                    <Label>최근 색인일</Label>
                    <Input value={formatDate(indexDetail.lastIndexedAt)} readOnly disabled className="bg-muted" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="data" className="w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>데이터 업로드</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>새 JSON 파일 업로드 (선택사항)</Label>
                  <Input 
                    type="file" 
                    accept=".json,application/json" 
                    onChange={handleFileChange}
                  />
                  {jsonFile && (
                    <div className="text-sm text-green-600 p-2 bg-green-50 rounded-md">
                      선택된 파일: {jsonFile.name} ({formatFileSize(jsonFile.size)})
                    </div>
                  )}
                  {indexDetail.fileName && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                      <div className="text-sm text-blue-700">
                        현재 파일: <span className="font-medium">{indexDetail.fileName}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleDownload}
                        className="bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200"
                      >
                        다운로드
                      </Button>
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground p-3 bg-gray-50 rounded-md">
                  <p><strong>파일 업데이트 안내:</strong></p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>새 파일을 선택하지 않으면 기존 파일을 유지합니다</li>
                    <li>파일 업로드 시 기존 파일은 교체됩니다</li>
                    <li>최대 파일 크기: 50MB</li>
                    <li>지원 형식: JSON 파일만 가능</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="mapping" className="w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>매핑 설정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Label>매핑 (Mapping, JSON)</Label>
                <textarea
                  className="w-full min-h-[200px] font-mono text-sm rounded-md border border-gray-200 p-3 bg-muted"
                  value={mappingValue}
                  readOnly
                  disabled
                  placeholder='{"properties": {"id": {"type": "keyword"}, "name": {"type": "text"}}}'
                />
                <p className="text-sm text-muted-foreground">
                  Elasticsearch 매핑 설정 (읽기 전용)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings" className="w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>인덱스 설정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Label>세팅 (Settings, JSON)</Label>
                <textarea
                  className="w-full min-h-[150px] font-mono text-sm rounded-md border border-gray-200 p-3 bg-muted"
                  value={settingsValue}
                  readOnly
                  disabled
                  placeholder='{"number_of_shards": 1, "number_of_replicas": 0}'
                />
                <p className="text-sm text-muted-foreground">
                  Elasticsearch 인덱스 설정 (읽기 전용)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="fixed right-8 bottom-8">
        <Button 
          size="lg" 
          onClick={handleSave} 
          disabled={saving}
          title={saving ? "색인 업데이트 중..." : "색인 업데이트"}
        >
          {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
          {saving ? "색인 업데이트 중..." : "색인 업데이트"}
        </Button>
      </div>
    </div>
  )
} 