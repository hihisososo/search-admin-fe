import { useState, useEffect } from "react"
import type { ChangeEvent } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "@/lib/api"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

const STEPS = [
  { key: "basicInfo", label: "기본정보" },
  { key: "data", label: "데이터 업로드" },
  { key: "mapping", label: "매핑" },
  { key: "settings", label: "세팅" },
]

interface IndexResponse {
    id: number
    name: string
    description?: string
    status: string
    docCount: number
    size: number
    lastIndexedAt: string
    fileName?: string
    mappings?: object
    settings?: object
}

interface CheckNameResponse {
    name: string
    exists: boolean
    message: string
}

export default function IndexAdd() {
    const [step, setStep] = useState(0)
    const [indexName, setIndexName] = useState("")
    const [description, setDescription] = useState("")
    const [nameCheck, setNameCheck] = useState<{ status: 'idle' | 'checking' | 'valid' | 'invalid', message: string }>({ status: 'idle', message: '' })
    const [mappingValue, setMappingValue] = useState(`{
  "properties": {
    "id": { "type": "keyword" },
    "name": { "type": "text" }
  }
}`)
    const [settingsValue, setSettingsValue] = useState(`{
  "number_of_shards": 1,
  "number_of_replicas": 0
}`)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [jsonFile, setJsonFile] = useState<File | null>(null)

    const navigate = useNavigate()

    // 색인명 유효성 검사
    const validateIndexName = (name: string): boolean => {
        if (name.length < 3 || name.length > 50) return false
        if (name.startsWith('_')) return false
        const validPattern = /^[a-z0-9_-]+$/
        return validPattern.test(name)
    }

    // 색인명 중복 체크 (디바운스)
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (indexName.trim()) {
                if (!validateIndexName(indexName)) {
                    setNameCheck({ 
                        status: 'invalid', 
                        message: '색인명은 3-50자 길이의 영문 소문자, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능합니다.' 
                    })
                    return
                }

                setNameCheck({ status: 'checking', message: '중복 확인 중...' })
                try {
                    const response = await apiFetch<CheckNameResponse>(`/api/v1/indexes/check-name?name=${encodeURIComponent(indexName)}`)
                    setNameCheck({ 
                        status: response.exists ? 'invalid' : 'valid', 
                        message: response.message 
                    })
                } catch (err) {
                    setNameCheck({ 
                        status: 'invalid', 
                        message: '중복 확인 중 오류가 발생했습니다. 다시 시도해주세요.' 
                    })
                }
            } else {
                setNameCheck({ status: 'idle', message: '' })
            }
        }, 500) // 500ms 딜레이

        return () => clearTimeout(timeoutId)
    }, [indexName])

    const handleSave = async () => {
        setError("")
        setLoading(true)
        
        try {
            // 유효성 검사
            if (!indexName.trim()) {
                throw new Error("색인 이름을 입력해주세요.")
            }

            if (nameCheck.status !== 'valid') {
                throw new Error("색인 이름을 확인해주세요.")
            }

            if (!jsonFile) {
                throw new Error("JSON 파일을 선택해주세요.")
            }

            // JSON 파싱 검증
            const mapping = JSON.parse(mappingValue)
            const settings = JSON.parse(settingsValue)
            
            // FormData 생성
            const formData = new FormData()
            const dto = {
                name: indexName,
                description: description.trim() || undefined,
                mappings: mapping,
                settings
            }
            
            formData.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }))
            formData.append('file', jsonFile)
            
            const response = await apiFetch<IndexResponse>('/api/v1/indexes', {
                method: 'POST',
                body: formData,
            })
            
            alert(`색인이 성공적으로 추가되었습니다!\n색인명: ${response.name}\n상태: ${response.status}`)
            navigate('/index')
            
        } catch (e) {
            if (e instanceof SyntaxError) {
                setError("매핑 또는 세팅이 유효한 JSON 형식이 아닙니다.")
            } else {
                setError(e instanceof Error ? e.message : "색인 추가 실패")
            }
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
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

    // step 상태를 탭 value로 동기화
    const currentStepKey = STEPS[step].key
    const handleTabChange = (value: string) => {
        const idx = STEPS.findIndex(s => s.key === value)
        if (idx !== -1) setStep(idx)
    }

    return (
        <div className="w-full p-6 relative min-h-[600px]">
            {/* 페이지 상단 제목 + 뒤로가기 버튼 */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">색인 추가</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        새로운 색인을 추가하고 관리할 수 있습니다.
                    </p>
                </div>
                <Button variant="outline" onClick={() => navigate('/index')}>뒤로가기</Button>
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
                <TabsContent value="basicInfo" className="w-full">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>기본정보</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label>색인 이름</Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="색인 이름을 입력하세요"
                                            value={indexName}
                                            onChange={e => setIndexName(e.target.value)}
                                            className={`pr-10 ${nameCheck.status === 'valid' ? 'border-green-500' : nameCheck.status === 'invalid' ? 'border-red-500' : ''}`}
                                        />
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            {nameCheck.status === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                                            {nameCheck.status === 'valid' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                            {nameCheck.status === 'invalid' && <XCircle className="h-4 w-4 text-red-500" />}
                                        </div>
                                    </div>
                                    {nameCheck.message && (
                                        <p className={`text-sm ${nameCheck.status === 'valid' ? 'text-green-600' : 'text-red-600'}`}>
                                            {nameCheck.message}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label>설명 (선택사항)</Label>
                                    <Input
                                        placeholder="색인에 대한 설명을 입력하세요"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        maxLength={500}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        최대 500자까지 입력할 수 있습니다.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="data" className="w-full">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>JSON 파일 업로드</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label>JSON 파일 선택</Label>
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
                                </div>
                                <div className="text-sm text-muted-foreground p-3 bg-gray-50 rounded-md">
                                    <p><strong>파일 업로드 요구사항:</strong></p>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                        <li>파일 형식: JSON 파일만 가능 (.json 확장자)</li>
                                        <li>최대 파일 크기: 50MB</li>
                                        <li>파일 내용: 유효한 JSON 배열 또는 객체</li>
                                        <li>인코딩: UTF-8 권장</li>
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
                                    className="w-full min-h-[200px] font-mono text-sm rounded-md border border-gray-200 p-3"
                                    value={mappingValue}
                                    onChange={e => setMappingValue(e.target.value)}
                                    placeholder='{"properties": {"id": {"type": "keyword"}, "name": {"type": "text"}}}'
                                />
                                <p className="text-sm text-muted-foreground">
                                    Elasticsearch 매핑 설정을 JSON 형식으로 입력하세요.
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
                                    className="w-full min-h-[150px] font-mono text-sm rounded-md border border-gray-200 p-3"
                                    value={settingsValue}
                                    onChange={e => setSettingsValue(e.target.value)}
                                    placeholder='{"number_of_shards": 1, "number_of_replicas": 0}'
                                />
                                <p className="text-sm text-muted-foreground">
                                    Elasticsearch 인덱스 설정을 JSON 형식으로 입력하세요.
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
                    disabled={loading || nameCheck.status !== 'valid' || !jsonFile}
                    title={loading ? "색인 생성 중..." : nameCheck.status !== 'valid' ? "색인명을 확인해주세요" : !jsonFile ? "JSON 파일을 선택해주세요" : "색인 추가"}
                >
                    {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                    {loading ? "색인 생성 중..." : "색인 추가"}
                </Button>
            </div>
        </div>
    )
}
