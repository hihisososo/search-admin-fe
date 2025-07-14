import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

export default function IndexManagement() {
    const navigate = useNavigate()
    
    return (
        <div className="p-6 space-y-6">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>색인관리</CardTitle>
                    <CardDescription>
                        색인 정보를 한눈에 확인하고 관리할 수 있는 리스트 페이지입니다
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>색인 목록</CardTitle>
                        <Button onClick={() => navigate('/index/add')}>
                            <Plus className="h-4 w-4 mr-2" />
                            새 색인 추가
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 mb-4 max-w-sm">
                        <Input placeholder="색인 검색..." />
                        <Button variant="outline" size="icon">
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>색인명</TableHead>
                                <TableHead>문서수</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead>크기</TableHead>
                                <TableHead>수정일</TableHead>
                                <TableHead>관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium cursor-pointer text-primary hover:underline" onClick={() => navigate('/index/view/DOC001')}>DOC001</TableCell>
                                <TableCell>검색 엔진 가이드</TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        완료
                                    </span>
                                </TableCell>
                                <TableCell>2024-01-15</TableCell>
                                <TableCell className="text-right">2.5MB</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => navigate('/index/view/DOC001')}>색인</Button>
                                        <Button size="sm" variant="destructive" onClick={() => alert('삭제 기능은 구현 필요')}>삭제</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium cursor-pointer text-primary hover:underline" onClick={() => navigate('/index/view/DOC002')}>DOC002</TableCell>
                                <TableCell>API 문서</TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        완료
                                    </span>
                                </TableCell>
                                <TableCell>2024-01-14</TableCell>
                                <TableCell className="text-right">1.8MB</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => navigate('/index/view/DOC002')}>색인</Button>
                                        <Button size="sm" variant="destructive" onClick={() => alert('삭제 기능은 구현 필요')}>삭제</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    {/* 페이지네이션 네비게이션 추가 */}
                    <div className="flex justify-center items-center gap-2 mt-6">
                        <Button variant="outline" size="sm">이전</Button>
                        <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
                        <Button variant="outline" size="sm">2</Button>
                        <Button variant="outline" size="sm">3</Button>
                        <span className="mx-2 text-muted-foreground">...</span>
                        <Button variant="outline" size="sm">10</Button>
                        <Button variant="outline" size="sm">다음</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
