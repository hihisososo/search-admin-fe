import { Card } from "@/components/ui/card";

interface PopularKeywordsProps {
  keywords: Array<{
    keyword: string;
    searchCount: number;
    rank: number;
    previousRank: number | null;
    rankChange: number | null;
    changeStatus: "UP" | "DOWN" | "NEW" | "SAME";
  }>;
  onKeywordClick: (keyword: string) => void;
}

export function PopularKeywords({ keywords, onKeywordClick }: PopularKeywordsProps) {
  const getChangeDisplay = (changeStatus: string, rankChange: number | null) => {
    switch (changeStatus) {
      case "NEW":
        return <span className="px-1 py-0.5 rounded bg-pink-100 text-pink-600 text-xs font-bold">NEW</span>;
      case "UP":
        return (
          <span className="text-xs font-bold flex items-center gap-0.5 text-red-500">
            ▲{rankChange ? Math.abs(rankChange) : 1}
          </span>
        );
      case "DOWN":
        return (
          <span className="text-xs font-bold flex items-center gap-0.5 text-blue-400">
            ▼{rankChange ? Math.abs(rankChange) : 1}
          </span>
        );
      case "SAME":
        return (
          <span className="text-xs font-bold flex items-center gap-0.5 text-gray-400">
            —
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="px-4 py-1 shadow-sm border border-gray-100 rounded-lg bg-white w-[240px]">
      <div className="font-bold text-blue-700 mb-1 text-base">인기 검색어</div>
      <ol className="list-decimal list-inside space-y-0.5">
        {keywords.slice(0, 10).map((k) => (
          <li 
            key={k.keyword} 
            className="flex items-center justify-between text-gray-900 hover:text-gray-600 cursor-pointer transition-colors truncate max-w-full text-sm"
            onClick={() => onKeywordClick(k.keyword)}
          >
            <span className="font-bold text-gray-900 text-sm mr-3 flex-shrink-0 w-6 text-center">{k.rank}.</span>
            <span className="truncate flex-1 min-w-0 max-w-full text-sm">{k.keyword}</span>
            <span className="ml-2 flex items-center flex-shrink-0">
              {getChangeDisplay(k.changeStatus, k.rankChange)}
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
} 