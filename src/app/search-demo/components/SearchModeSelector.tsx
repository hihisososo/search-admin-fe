import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { SearchMode } from "@/lib/api";

interface SearchModeSelectorProps {
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
  rrfK: number;
  setRrfK: (k: number) => void;
  hybridTopK: number;
  setHybridTopK: (k: number) => void;
  vectorMinScore?: number | null;
  setVectorMinScore?: (score: number | null) => void;
}

export function SearchModeSelector({
  searchMode,
  setSearchMode,
  rrfK,
  setRrfK,
  hybridTopK,
  setHybridTopK,
  vectorMinScore,
  setVectorMinScore
}: SearchModeSelectorProps) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <Label className="text-xs font-medium text-muted-foreground">
          검색 모드
        </Label>
        <Select value={searchMode} onValueChange={(value) => setSearchMode(value as SearchMode)}>
          <SelectTrigger className="w-32 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="KEYWORD_ONLY">키워드 검색</SelectItem>
            <SelectItem value="VECTOR_MULTI_FIELD">벡터 검색</SelectItem>
            <SelectItem value="HYBRID_RRF">하이브리드</SelectItem>
          </SelectContent>
        </Select>
      </div>
          
      {searchMode === "HYBRID_RRF" && (
        <>
          <div className="flex items-center gap-2">
            <Label className="text-xs font-medium text-muted-foreground">
              RRF K
            </Label>
            <Input
              type="number"
              value={rrfK}
              onChange={(e) => setRrfK(Number(e.target.value))}
              className="w-14 h-7 text-xs"
              min={1}
              max={100}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Top K
            </Label>
            <Input
              type="number"
              value={hybridTopK}
              onChange={(e) => setHybridTopK(Number(e.target.value))}
              className="w-16 h-7 text-xs"
              min={10}
              max={500}
            />
          </div>
        </>
      )}
          
      {(searchMode === "VECTOR_MULTI_FIELD" || searchMode === "HYBRID_RRF") && setVectorMinScore && (
        <div className="flex items-center gap-2">
          <Label 
            className="text-xs font-medium text-muted-foreground"
            title={searchMode === "VECTOR_MULTI_FIELD" ? "권장: 0.6~0.75" : "권장: 0.55~0.7"}
          >
            최소 점수
          </Label>
          <Input
            type="number"
            value={vectorMinScore ?? 0.7}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 0 && value <= 1) {
                setVectorMinScore(value);
              }
            }}
            className="w-16 h-7 text-xs"
            min={0}
            max={1}
            step={0.05}
          />
          <span className="text-xs text-muted-foreground">
            {searchMode === "VECTOR_MULTI_FIELD" ? "(0.6~0.75)" : "(0.55~0.7)"}
          </span>
        </div>
      )}
    </div>
  );
}