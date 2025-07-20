import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import type { Product } from "@/lib/api";

interface ProductListProps {
  products: Product[];
  loading: boolean;
  totalResults: number;
  totalPages: number;
  page: number;
  setPage: (page: number) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  searchQuery: string;
}

const SORT_OPTIONS = [
  { label: "정확도순", value: "score" },
  { label: "낮은가격순", value: "price_asc" },
  { label: "높은가격순", value: "price_desc" },
  { label: "리뷰많은순", value: "reviewCount" },
  { label: "신상품순", value: "registeredMonth" },
];

function highlight(text: string, keyword: string) {
  if (!keyword) return text;
  
  // 공백으로 키워드를 분리하고 빈 문자열 제거
  const keywords = keyword.trim().split(/\s+/).filter(k => k.length > 0);
  if (keywords.length === 0) return text;
  
  // 각 키워드를 이스케이프하고 합침
  const escapedKeywords = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escapedKeywords.join('|')})`, "gi");
  
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <span key={i} style={{ color: '#2563eb', fontWeight: 600 }}>{part}</span>
      : part
  );
}

export function ProductList({
  products,
  loading,
  totalResults,
  totalPages,
  page,
  setPage,
  sort,
  onSortChange,
  searchQuery
}: ProductListProps) {
  return (
    <Card className="p-6 shadow-lg border border-gray-200 rounded-2xl bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          총 {totalResults.toLocaleString()}개 상품
        </div>
        <div className="flex gap-2">
          {SORT_OPTIONS.map(opt => (
            <Button 
              key={opt.value} 
              variant={sort === opt.value ? "default" : "outline"} 
              size="sm" 
              onClick={() => onSortChange(opt.value)} 
              className="rounded-full shadow-sm transition-colors duration-150 hover:scale-105 text-xs"
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">이미지</TableHead>
            <TableHead>상품정보</TableHead>
            <TableHead className="text-right">가격</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-400 py-8">로딩 중...</TableCell>
            </TableRow>
          ) : products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-400 py-8">검색 결과가 없습니다.</TableCell>
            </TableRow>
          ) : products.map(p => (
            <TableRow key={p.id} className="transition-colors hover:bg-blue-50/60 cursor-pointer rounded-xl">
              <TableCell className="py-4">
                <img 
                  src={p.thumbnailUrl} 
                  alt={p.nameRaw || p.name} 
                  className="rounded-xl w-20 h-20 object-cover border shadow-sm" 
                />
              </TableCell>
              <TableCell className="py-4">
                <div className="space-y-3 max-w-2xl">
                  {/* 상품명 */}
                  <div className="font-semibold text-lg text-gray-900 leading-tight">
                    {searchQuery ? highlight(p.nameRaw || p.name, searchQuery) : (p.nameRaw || p.name)}
                  </div>
                  
                  {/* description */}
                  {p.descriptionRaw && (
                    <div 
                      className="text-sm text-gray-600 leading-relaxed whitespace-pre-line"
                    >
                      {searchQuery ? highlight(p.descriptionRaw, searchQuery) : p.descriptionRaw}
                    </div>
                  )}
                  
                  {/* 등록월, 리뷰개수 */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      리뷰 {p.reviewCount?.toLocaleString()}개
                    </span>
                  </div>
                  
                  {/* 카테고리 */}
                  <div>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      카테고리: {p.category}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right py-4">
                <div className="font-bold text-blue-700 text-lg">
                  {p.price?.toLocaleString()}원
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </Card>
  );
} 