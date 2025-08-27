import { Card, CardContent } from "@/components/ui/card";
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
}

export function SearchModeSelector({
  searchMode,
  setSearchMode,
  rrfK,
  setRrfK,
  hybridTopK,
  setHybridTopK
}: SearchModeSelectorProps) {
  return (
    <Card className="shadow-sm border border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Label className="text-xs font-semibold text-foreground">
              검색 모드
            </Label>
            <Select value={searchMode} onValueChange={(value) => setSearchMode(value as SearchMode)}>
              <SelectTrigger className="w-40 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KEYWORD_ONLY">키워드 검색</SelectItem>
                <SelectItem value="VECTOR_ONLY">벡터 검색</SelectItem>
                <SelectItem value="HYBRID_RRF">하이브리드</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {searchMode === "HYBRID_RRF" && (
            <>
              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold text-foreground">
                  RRF K
                </Label>
                <Input
                  type="number"
                  value={rrfK}
                  onChange={(e) => setRrfK(Number(e.target.value))}
                  className="w-16 h-7 text-xs"
                  min={1}
                  max={100}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold text-foreground">
                  Top K
                </Label>
                <Input
                  type="number"
                  value={hybridTopK}
                  onChange={(e) => setHybridTopK(Number(e.target.value))}
                  className="w-20 h-7 text-xs"
                  min={10}
                  max={500}
                />
              </div>
            </>
          )}
          
        </div>
      </CardContent>
    </Card>
  );
}