import { useState } from "react"
import type { ChangeEvent } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"

const STEPS = [
  { key: "indexName", label: "색인 이름" },
  { key: "data", label: "데이터설정" },
  { key: "mapping", label: "매핑" },
  { key: "settings", label: "세팅" },
]

export default function IndexAdd() {
    const [step, setStep] = useState(0)
    const [indexName, setIndexName] = useState("")
    const [mappingValue, setMappingValue] = useState(`{
  "properties": {}
}`)
    const [settingsValue, setSettingsValue] = useState(`{
  "number_of_shards": 1,
  "number_of_replicas": 1
}`)
    const [error, setError] = useState("")

    const [dataSource, setDataSource] = useState<"db" | "json">("db")
    const [jdbcUrl, setJdbcUrl] = useState("")
    const [jdbcUser, setJdbcUser] = useState("")
    const [jdbcPassword, setJdbcPassword] = useState("")
    const [jdbcQuery, setJdbcQuery] = useState("")
    const [jsonFile, setJsonFile] = useState<File | null>(null)

    const navigate = useNavigate()

    const handleSave = () => {
        setError("")
        try {
            const mapping = JSON.parse(mappingValue)
            const settings = JSON.parse(settingsValue)
            console.log("색인 이름:", indexName)
            console.log("매핑:", mapping)
            console.log("세팅:", settings)
            if (dataSource === "db") {
                console.log("DB 설정:", { jdbcUrl, jdbcUser, jdbcPassword, jdbcQuery })
            } else {
                console.log("JSON 파일:", jsonFile)
            }
            alert("저장되었습니다!")
        } catch (e) {
            setError("매핑 또는 세팅이 유효한 JSON 형식이 아닙니다.")
        }
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setJsonFile(e.target.files[0])
        } else {
            setJsonFile(null)
        }
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
                <h1 className="text-2xl font-bold">색인 추가</h1>
                <Button variant="outline" onClick={() => navigate('/index')}>뒤로가기</Button>
            </div>
            <Tabs value={currentStepKey} onValueChange={handleTabChange} className="w-full">
                <TabsList className="w-full">
                    {STEPS.map((s) => (
                        <TabsTrigger key={s.key} value={s.key} className="w-full">
                            {s.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <TabsContent value="indexName" className="w-full">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>색인 추가</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2">
                                <Label>색인 이름</Label>
                                <Input
                                    placeholder="색인 이름을 입력하세요"
                                    value={indexName}
                                    onChange={e => setIndexName(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="data" className="w-full">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>데이터설정</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="my-2">
                                <Label>데이터 소스</Label>
                                <RadioGroup
                                    value={dataSource}
                                    onValueChange={val => setDataSource(val as "db" | "json")}
                                    className="flex flex-row gap-6 mt-2"
                                >
                                    <div className="flex items-center gap-1">
                                        <RadioGroupItem value="db" id="db-radio" />
                                        <Label htmlFor="db-radio">DB</Label>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <RadioGroupItem value="json" id="json-radio" />
                                        <Label htmlFor="json-radio">JSON 파일</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            {dataSource === "db" ? (
                                <div className="flex flex-col gap-2">
                                    <Label>JDBC URL</Label>
                                    <Input
                                        placeholder="jdbc:mysql://host:port/db"
                                        value={jdbcUrl}
                                        onChange={e => setJdbcUrl(e.target.value)}
                                    />
                                    <Label>Username</Label>
                                    <Input
                                        placeholder="DB 사용자명"
                                        value={jdbcUser}
                                        onChange={e => setJdbcUser(e.target.value)}
                                    />
                                    <Label>Password</Label>
                                    <Input
                                        type="password"
                                        placeholder="비밀번호"
                                        value={jdbcPassword}
                                        onChange={e => setJdbcPassword(e.target.value)}
                                    />
                                    <Label>수집 쿼리</Label>
                                    <Input
                                        placeholder="SELECT * FROM ..."
                                        value={jdbcQuery}
                                        onChange={e => setJdbcQuery(e.target.value)}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Label>JSON 파일 업로드</Label>
                                    <Input type="file" accept=".json,application/json" onChange={handleFileChange} />
                                    {jsonFile && <div>선택된 파일: {jsonFile.name}</div>}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="mapping" className="w-full">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>매핑</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2">
                                <Label>매핑 (Mapping, JSON)</Label>
                                <textarea
                                    className="w-full min-h-[180px] font-mono text-[14px] rounded-md border border-gray-200 p-2"
                                    value={mappingValue}
                                    onChange={e => setMappingValue(e.target.value)}
                                    placeholder='{"properties":{}}'
                                />
                                {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="settings" className="w-full">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>세팅</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2">
                                <Label>세팅 (Settings, JSON)</Label>
                                <textarea
                                    className="w-full min-h-[120px] font-mono text-[14px] rounded-md border border-gray-200 p-2"
                                    value={settingsValue}
                                    onChange={e => setSettingsValue(e.target.value)}
                                    placeholder='{"number_of_shards":1, "number_of_replicas":1}'
                                />
                                {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
                <div className="fixed right-8 mt-2">
                    <Button size="lg" onClick={handleSave}>완료</Button>
                </div>
        </div>
    )
}
