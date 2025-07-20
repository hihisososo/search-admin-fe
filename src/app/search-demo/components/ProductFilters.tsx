import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <Card className="p-4 shadow-lg border border-blue-100 rounded-2xl bg-white flex flex-col gap-0">
      {/* 카테고리 */}
      <div className="flex items-start gap-2 mb-2">
        <div className="flex items-center gap-2 mt-1">
          <span className="font-bold text-gray-700 text-xs whitespace-nowrap">카테고리</span>
          <span className="text-gray-200">|</span>
        </div>
        <div className="flex-1">
          <div 
            className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto pr-2" 
            style={{ scrollbarWidth: 'thin' }}
          >
            {categoryAgg.map(cat => (
              <Checkbox
                key={cat.key}
                checked={category.includes(cat.key)}
                onCheckedChange={(checked) => handleCategory(cat.key, checked)}
                className="text-[11px]"
              >
                {cat.key} <span className="text-gray-400 text-[11px]">({cat.docCount})</span>
              </Checkbox>
            ))}
          </div>
        </div>
      </div>
      
      {/* 구분선 */}
      <div className="w-full h-px bg-gray-200 my-2" />
      
      {/* 브랜드 */}
      <div className="flex items-start gap-2 mb-2">
        <div className="flex items-center gap-2 mt-1">
          <span className="font-bold text-gray-700 text-xs whitespace-nowrap">브랜드</span>&nbsp;
          <span className="text-gray-200">|</span>
        </div>
        <div className="flex-1">
          <div 
            className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto pr-2" 
            style={{ scrollbarWidth: 'thin' }}
          >
            {brandAgg.map(b => (
              <Checkbox
                key={b.key}
                checked={brand.includes(b.key)}
                onCheckedChange={(checked) => handleBrandFilter(b.key, checked)}
                className="text-xs"
              >
                {b.key} <span className="text-gray-400">({b.docCount})</span>
              </Checkbox>
            ))}
          </div>
        </div>
      </div>
      
      {/* 구분선 */}
      <div className="w-full h-px bg-gray-200 my-2" />
      
      {/* 가격대 */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-700 text-xs whitespace-nowrap">가격대</span>&nbsp;
          <span className="text-gray-200">|</span>
        </div>
        <div className="flex gap-2 items-center">
          <Input 
            value={price.from} 
            onChange={e => handlePrice("from", e.target.value)} 
            placeholder="최소" 
            className="w-20 text-xs" 
          />
          <span className="text-xs">~</span>
          <Input 
            value={price.to} 
            onChange={e => handlePrice("to", e.target.value)} 
            placeholder="최대" 
            className="w-20 text-xs" 
          />
          <Button
            size="sm"
            onClick={onPriceSearch}
            className="ml-2 text-xs px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
          >
            검색
          </Button>
        </div>
      </div>
      
      {/* 필터 초기화 버튼 */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onResetFilters}
        className="mt-4 text-gray-500 border border-gray-200 rounded-full shadow-sm transition-colors duration-150 hover:scale-105 text-xs self-end"
      >
        필터 초기화
      </Button>
    </Card>
  );
} 