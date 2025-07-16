import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { Plus, Upload } from "lucide-react"

interface DeploymentVersion {
    id: number
    version: string
    description?: string
    snapshotCount: number
    createdAt: string
}

interface UserDictionaryHeaderProps {
    search: string
    onSearchChange: (value: string) => void
    onSearch: () => void
    onAdd: () => void
    onDeploy: () => void
    deploying: boolean
    addingItem: boolean
    versions: DeploymentVersion[]
    selectedVersion: string | null
    onVersionChange: (version: string) => void
}

export function UserDictionaryHeader({
    search,
    onSearchChange,
    onSearch,
    onAdd,
    onDeploy,
    deploying,
    addingItem,
    versions,
    selectedVersion,
    onVersionChange
}: UserDictionaryHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <CardTitle>사전 목록</CardTitle>
                <div className="flex gap-2">
                    <Button onClick={onAdd} disabled={addingItem}>
                        <Plus className="h-4 w-4 mr-2" />
                        추가
                    </Button>
                    <Button 
                        onClick={onDeploy} 
                        disabled={deploying}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {deploying ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                            <Upload className="h-4 w-4 mr-2" />
                        )}
                        버전 생성
                    </Button>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex gap-2 items-center">
                    <Input 
                        placeholder="키워드 검색..." 
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-48"
                    />
                    <Button variant="outline" size="sm" onClick={onSearch}>
                        검색
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">버전:</span>
                    <select 
                        value={selectedVersion || ''} 
                        onChange={(e) => onVersionChange(e.target.value)}
                        className="px-3 py-1 border rounded-md text-sm"
                    >
                        <option value="">전체</option>
                        {versions.map(version => (
                            <option key={version.id} value={version.version}>
                                {version.version} ({version.snapshotCount}개)
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    )
} 