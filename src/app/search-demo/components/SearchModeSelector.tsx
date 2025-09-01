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
  nameVectorBoost?: number;
  setNameVectorBoost?: (boost: number) => void;
  specsVectorBoost?: number;
  setSpecsVectorBoost?: (boost: number) => void;
  bm25Weight?: number;
  setBm25Weight?: (weight: number) => void;
}

export function SearchModeSelector({
  searchMode,
  setSearchMode,
  rrfK,
  setRrfK,
  hybridTopK,
  setHybridTopK,
  vectorMinScore,
  setVectorMinScore,
  nameVectorBoost,
  setNameVectorBoost,
  specsVectorBoost,
  setSpecsVectorBoost,
  bm25Weight,
  setBm25Weight
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
          
          {setBm25Weight && (
            <div className="flex items-center gap-2">
              <Label 
                className="text-xs font-medium text-muted-foreground"
                title="BM25 가중치 (0.0-1.0)"
              >
                BM25 가중치
              </Label>
              <Input
                type="number"
                value={bm25Weight ?? 0.5}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 0 && value <= 1) {
                    setBm25Weight(value);
                  }
                }}
                className="w-16 h-7 text-xs"
                min={0}
                max={1}
                step={0.1}
              />
              <span className="text-xs text-muted-foreground">
                (0.0-1.0)
              </span>
            </div>
          )}
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
      
      {(searchMode === "VECTOR_MULTI_FIELD" || searchMode === "HYBRID_RRF") && setNameVectorBoost && setSpecsVectorBoost && (
        <>
          <div className="flex items-center gap-2">
            <Label 
              className="text-xs font-medium text-muted-foreground"
              title="상품명 벡터 필드 가중치"
            >
              Name 가중치
            </Label>
            <Input
              type="number"
              value={nameVectorBoost ?? 0.7}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 0 && value <= 1) {
                  setNameVectorBoost(value);
                }
              }}
              className="w-16 h-7 text-xs"
              min={0}
              max={1}
              step={0.1}
            />
            <span className="text-xs text-muted-foreground">
              (0.0~1.0)
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Label 
              className="text-xs font-medium text-muted-foreground"
              title="상품 스펙 벡터 필드 가중치"
            >
              Specs 가중치
            </Label>
            <Input
              type="number"
              value={specsVectorBoost ?? 0.3}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 0 && value <= 1) {
                  setSpecsVectorBoost(value);
                }
              }}
              className="w-16 h-7 text-xs"
              min={0}
              max={1}
              step={0.1}
            />
            <span className="text-xs text-muted-foreground">
              (0.0~1.0)
            </span>
          </div>
        </>
      )}
    </div>
  );
}