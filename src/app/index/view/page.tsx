import { useNavigate, useParams } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"

const STEPS = [
  { key: "indexName", label: "색인 이름" },
  { key: "data", label: "데이터설정" },
  { key: "mapping", label: "매핑" },
  { key: "settings", label: "세팅" },
]

export default function IndexView() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [step, setStep] = useState(0)
  // 상태 관리: 데이터설정만 수정 가능
  const [dataSource, setDataSource] = useState<"db" | "json">("db")
  const [jdbcUrl, setJdbcUrl] = useState("jdbc:mysql://localhost:3306/mydb")
  const [jdbcUser, setJdbcUser] = useState("admin")
  const [jdbcPassword, setJdbcPassword] = useState("********")
  const [jdbcQuery, setJdbcQuery] = useState("SELECT * FROM documents")
  const [jsonFile, setJsonFile] = useState<File | null>(null)
  const [saveMsg, setSaveMsg] = useState("")

  const indexName = id || "DOC001"
  const mappingValue = `{
  "properties": {
    "title": { "type": "text" },
    "content": { "type": "text" }
  }
}`
  const settingsValue = `{
  "number_of_shards": 1,
  "number_of_replicas": 1
}`
  const currentStepKey = STEPS[step].key
  const handleTabChange = (value: string) => {
    const idx = STEPS.findIndex(s => s.key === value)
    if (idx !== -1) setStep(idx)
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setJsonFile(e.target.files[0])
    } else {
      setJsonFile(null)
    }
  }
  const handleSave = () => {
    // 저장 로직 (API 연동 등)
    setSaveMsg("")
    if (dataSource === "db") {
      // DB 정보 저장
      // 실제 API 연동 시 여기에 추가
      alert("DB 데이터 설정이 저장되었습니다!")
    } else {
      // JSON 파일 업로드
      alert("JSON 파일 데이터 설정이 저장되었습니다!")
    }
  }
  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">색인 상세</h1>
        <Button variant="outline" onClick={() => navigate('/index')}>목록으로</Button>
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
              <CardTitle>색인 이름</CardTitle>
            </CardHeader>
            <CardContent>
              <Input value={indexName} readOnly disabled className="bg-muted" />
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
            <div className="flex justify-end px-6 pb-4">
              <Button size="lg" onClick={handleSave}>저장</Button>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="mapping" className="w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>매핑</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full min-h-[180px] font-mono text-[14px] rounded-md border border-gray-200 p-2 bg-muted"
                value={mappingValue}
                readOnly
                disabled
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings" className="w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>세팅</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full min-h-[120px] font-mono text-[14px] rounded-md border border-gray-200 p-2 bg-muted"
                value={settingsValue}
                readOnly
                disabled
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 