import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
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

// 로딩 skeleton 행 컴포넌트
function LoadingRow() {
  return (
    <TableRow className="animate-pulse">
      <TableCell className="py-4">
        <Skeleton className="w-28 h-28 rounded-xl" />
      </TableCell>
      <TableCell className="py-4">
        <div className="space-y-3 max-w-2xl">
          <Skeleton className="h-6 w-3/4" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
      </TableCell>
      <TableCell className="text-right py-4">
        <Skeleton className="h-6 w-20 ml-auto" />
      </TableCell>
    </TableRow>
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
    <>
      {/* 간단한 로딩 애니메이션 */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-sm text-blue-600 font-medium">검색 중</span>
          </div>
        </div>
      )}
      
      <Card className="p-6 shadow-lg border border-gray-200 rounded-2xl bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          {loading ? (
            <Skeleton className="h-5 w-32" />
          ) : (
            `총 ${totalResults.toLocaleString()}개 상품`
          )}
        </div>
        <div className="flex gap-2">
          {SORT_OPTIONS.map(opt => (
            <Button 
              key={opt.value} 
              variant={sort === opt.value ? "default" : "outline"} 
              size="sm" 
              onClick={() => onSortChange(opt.value)} 
              className="rounded-full shadow-sm transition-colors duration-150 hover:scale-105 text-xs"
              disabled={loading}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32">이미지</TableHead>
            <TableHead>상품정보</TableHead>
            <TableHead className="text-right">가격</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            // 로딩 중일 때 skeleton 행들 표시
            Array.from({ length: 5 }).map((_, index) => (
              <LoadingRow key={index} />
            ))
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
                  className="rounded-xl w-28 h-28 object-cover border shadow-sm" 
                />
              </TableCell>
              <TableCell className="py-4">
                <div className="space-y-3 max-w-2xl">
                  {/* 상품명 */}
                  <div className="font-semibold text-lg text-gray-900 leading-tight">
                    {searchQuery ? highlight(p.nameRaw || p.name, searchQuery) : (p.nameRaw || p.name)}
                  </div>
                  
                  {/* 상품 상세설명 */}
                  {p.specsRaw && (
                    <div 
                      className="text-xs text-gray-500 leading-snug whitespace-pre-line opacity-80"
                    >
                      {searchQuery ? highlight(p.specsRaw, searchQuery) : p.specsRaw}
                    </div>
                  )}
                  
                  {/* 등록월, 리뷰개수 */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {p.registeredMonth && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {p.registeredMonth}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      리뷰 {p.reviewCount?.toLocaleString()}개
                    </span>
                  </div>
                  
                  {/* 카테고리 */}
                  <div>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      카테고리: {p.categoryName}
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
      
      {totalPages > 1 && !loading && (
        <div className="space-y-3">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          <div className="text-center text-sm text-gray-500">
            {page} / {totalPages} 페이지 (총 {totalResults.toLocaleString()}개 상품)
          </div>
        </div>
      )}
    </Card>
    </>
  );
} 