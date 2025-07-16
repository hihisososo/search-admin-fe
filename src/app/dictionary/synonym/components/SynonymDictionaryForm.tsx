import { Input } from "@/components/ui/input"

interface SynonymDictionaryFormProps {
    mode: 'add' | 'edit'
    keyword: string
    onKeywordChange: (value: string) => void
    isValid: boolean
    error?: string
}

const getKeywordHelp = () => (
    <div className="text-xs text-muted-foreground mt-1">
        키워드를 입력해주세요 (예: 휴대폰, 핸드폰, 모바일)
    </div>
)

export function SynonymDictionaryForm({
    mode,
    keyword,
    onKeywordChange,
    isValid,
    error
}: SynonymDictionaryFormProps) {
    return (
        <div className="space-y-2">
            <div className="space-y-2">
                <Input
                    value={keyword}
                    onChange={(e) => onKeywordChange(e.target.value)}
                    placeholder={mode === 'add' ? "휴대폰, 핸드폰, 모바일, 스마트폰" : ""}
                    className={`${!keyword || isValid ? '' : 'border-red-500'}`}
                    autoFocus={mode === 'add'}
                />
                {getKeywordHelp()}
            </div>
            {error && (
                <div className="text-red-600 text-xs">
                    {error}
                </div>
            )}
        </div>
    )
} 