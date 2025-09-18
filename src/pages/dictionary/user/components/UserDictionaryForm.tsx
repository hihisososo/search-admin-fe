import { Input } from "@/components/ui/input"

interface UserDictionaryFormProps {
    mode: 'add' | 'edit'
    keyword: string
    description?: string
    onKeywordChange: (value: string) => void
    onDescriptionChange: (value: string) => void
    isValid: boolean
    error?: string
}

const getKeywordHelp = () => (
    <div className="text-xs text-muted-foreground mt-1">
        키워드를 입력해주세요 (예: 병원, 의료기관, 진료소)
    </div>
)

export function UserDictionaryForm({
    mode,
    keyword,
    description = "",
    onKeywordChange,
    onDescriptionChange,
    isValid,
    error
}: UserDictionaryFormProps) {
    return (
        <div className="space-y-2">
            <div className="space-y-2">
                <Input
                    value={keyword}
                    onChange={(e) => onKeywordChange(e.target.value)}
                    placeholder={mode === 'add' ? "병원, 의료기관, 진료소" : ""}
                    className={`${!keyword || isValid ? '' : 'border-red-500'}`}
                    autoFocus={mode === 'add'}
                />
                {getKeywordHelp()}
            </div>
            <Input
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="설명 (선택사항)"
            />
            {error && (
                <div className="text-red-600 text-xs">
                    {error}
                </div>
            )}
        </div>
    )
} 