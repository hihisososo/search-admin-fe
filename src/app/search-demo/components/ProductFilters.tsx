import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import type { AggregationBucket } from "@/lib/api";

interface ProductFiltersProps {
  category: string[];
  setCategory: React.Dispatch<React.SetStateAction<string[]>>;
  categorySub: string[];
  setCategorySub: React.Dispatch<React.SetStateAction<string[]>>;
  brand: string[];
  setBrand: React.Dispatch<React.SetStateAction<string[]>>;
  price: { from: string; to: string };
  setPrice: React.Dispatch<React.SetStateAction<{ from: string; to: string }>>;
  brandAgg: AggregationBucket[];
  categoryAgg: AggregationBucket[];
  onResetFilters: () => void;
  onPriceSearch: () => void;
}

export function ProductFilters({
  category,
  setCategory,
  categorySub,
  setCategorySub,
  brand,
  setBrand,
  price,
  setPrice,
  brandAgg,
  categoryAgg,
  onResetFilters,
  onPriceSearch
}: ProductFiltersProps) {
  const handleCategory = (c: string, checked: boolean) => {
    if (checked) {
      setCategory(arr => [...arr, c]);
    } else {
      setCategory(arr => arr.filter(x => x !== c));
    }
  };
  
  const handlePrice = (k: "from" | "to", v: string) => {
    setPrice(pr => ({ ...pr, [k]: v.replace(/[^0-9]/g, "") }));
  };

  const handleBrandFilter = (brandName: string, checked: boolean) => {
    if (checked) {
      setBrand(arr => [...arr, brandName]);
    } else {
      setBrand(arr => arr.filter(x => x !== brandName));
    }
  };

  return (
    <Card className="shadow-sm border border-border">
      <CardContent className="p-4">
        {/* 카테고리 섹션 */}
        <div className="flex items-start gap-4 mb-4">
          <Label className="text-sm font-semibold text-foreground w-24 mt-1">
            카테고리
          </Label>
          <div className="grid grid-cols-5 gap-x-4 gap-y-2 flex-1">
            {categoryAgg.map(cat => (
              <div key={cat.key} className="flex items-center space-x-2">
                <Checkbox
                  checked={category.includes(cat.key)}
                  onCheckedChange={(checked) => handleCategory(cat.key, checked)}
                  className="h-4 w-4"
                />
                <Label 
                  className="text-xs font-normal cursor-pointer leading-tight"
                  onClick={() => handleCategory(cat.key, !category.includes(cat.key))}
                >
                  {cat.key} 
                  <span className="text-muted-foreground ml-1">
                    ({cat.docCount})
                  </span>
                </Label>
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            {category.length > 0 ? `${category.length}개` : ''} 
            {categoryAgg.length > 10 && <span className="ml-1">+</span>}
          </div>
        </div>

        <Separator className="my-3" />

        {/* 제조사/브랜드 섹션 */}
        <div className="flex items-start gap-4 mb-4">
          <Label className="font-semibold text-foreground w-24 mt-1">
            제조사/브랜드
          </Label>
          <div className="grid grid-cols-5 gap-x-4 gap-y-2 flex-1">
            {brandAgg.map(b => (
              <div key={b.key} className="flex items-center space-x-2">
                <Checkbox
                  checked={brand.includes(b.key)}
                  onCheckedChange={(checked) => handleBrandFilter(b.key, checked)}
                  className="h-4 w-4"
                />
                <Label 
                  className="text-xs font-normal cursor-pointer leading-tight"
                  onClick={() => handleBrandFilter(b.key, !brand.includes(b.key))}
                >
                  {b.key} 
                  <span className="text-muted-foreground ml-1">
                    ({b.docCount})
                  </span>
                </Label>
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            {brand.length > 0 ? `${brand.length}개` : ''} 
            {brandAgg.length > 10 && <span className="ml-1">+</span>}
          </div>
        </div>

        <Separator className="my-3" />

        {/* 가격 섹션 */}
        <div className="flex items-center gap-4">
          <Label className="text-sm font-semibold text-foreground w-24">
            가격
          </Label>
          <div className="flex items-center gap-2">
            <Input 
              value={price.from} 
              onChange={e => handlePrice("from", e.target.value)} 
              placeholder="원" 
              className="w-20 h-7 text-xs" 
            />
            <span className="text-xs text-muted-foreground">~</span>
            <Input 
              value={price.to} 
              onChange={e => handlePrice("to", e.target.value)} 
              placeholder="원" 
              className="w-20 h-7 text-xs" 
            />
            <Button
              size="sm"
              onClick={onPriceSearch}
              className="h-7 px-3 text-xs bg-gray-600 hover:bg-gray-700"
            >
              검색
            </Button>
          </div>
          
          {/* 필터 초기화 */}
          <div className="ml-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onResetFilters}
              className="text-xs h-7 px-3"
            >
              필터 초기화
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 