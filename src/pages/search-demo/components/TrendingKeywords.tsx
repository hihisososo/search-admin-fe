import { Card, CardContent } from "@/components/ui/card";

interface TrendingKeywordsProps {
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

export function TrendingKeywords({ keywords, onKeywordClick }: TrendingKeywordsProps) {
	const getChangeDisplay = (changeStatus: string, rankChange: number | null) => {
		switch (changeStatus) {
			case "NEW":
				return <span className="px-0.5 rounded bg-pink-100 text-pink-600 text-[11px] font-medium">NEW</span>;
			case "UP":
				return (
					<span className="text-[11px] font-medium flex items-center gap-0.5 text-red-500">
						▲{rankChange ? Math.abs(rankChange) : 1}
					</span>
				);
			case "DOWN":
				return (
					<span className="text-[11px] font-medium flex items-center gap-0.5 text-blue-400">
						▼{rankChange ? Math.abs(rankChange) : 1}
					</span>
				);
			case "SAME":
				return (
					<span className="text-[11px] font-medium flex items-center gap-0.5 text-gray-400">
						—
					</span>
				);
			default:
				return null;
		}
	};

	return (
		<Card className="w-full shadow-sm border border-border mt-3 py-0">
			<CardContent className="p-3 pt-2">
				<div className="text-black font-semibold text-foreground mb-4">급등 검색어</div>
			<ol className="list-decimal list-inside space-y-0">
				{keywords.slice(0, 10).map((k) => (
					<li 
						key={k.keyword} 
						className="flex items-center justify-between text-gray-700 hover:text-gray-900 cursor-pointer transition-colors truncate max-w-full text-[13px] py-0.5"
						onClick={() => onKeywordClick(k.keyword)}
					>
						<span className="font-medium text-gray-700 text-[13px] mr-3 flex-shrink-0 w-6 text-center">{k.rank}.</span>
						<span className="truncate flex-1 min-w-0 max-w-full text-[13px] font-medium">{k.keyword}</span>
						<span className="ml-2 flex items-center flex-shrink-0">
							{getChangeDisplay(k.changeStatus, k.rankChange)}
						</span>
					</li>
				))}
			</ol>
			</CardContent>
		</Card>
	);
}


