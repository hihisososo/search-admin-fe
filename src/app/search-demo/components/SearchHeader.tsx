import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { searchApi } from "@/lib/api";

interface SearchHeaderProps {
  query: string;
  setQuery: (query: string) => void;
  onSearch: (query: string) => void;
  relatedKeywords: string[];
}

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

export function SearchHeader({ query, setQuery, onSearch, relatedKeywords }: SearchHeaderProps) {
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [showSuggest, setShowSuggest] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [originalQuery, setOriginalQuery] = React.useState(""); // 사용자가 입력한 원본 쿼리 저장

  // 자동완성 처리
  React.useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        const response = await searchApi.getAutocomplete(query);
        setSuggestions(response.suggestions);
        setSelectedIndex(-1); // 새로운 자동완성 시 선택 초기화
        setOriginalQuery(query); // 원본 쿼리 저장
      } catch (error) {
        console.error('자동완성 오류:', error);
        setSuggestions([]);
      }
    }, 200); // 200ms 디바운싱

    return () => clearTimeout(timeoutId);
  }, [query]);

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggest || suggestions.length === 0) {
      if (e.key === 'Enter') {
        onSearch(query);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const selectedSuggestion = suggestions[selectedIndex];
          setQuery(selectedSuggestion);
          onSearch(selectedSuggestion);
          setShowSuggest(false);
        } else {
          onSearch(query);
        }
        break;
      case 'Escape':
        setShowSuggest(false);
        setSelectedIndex(-1);
        setQuery(originalQuery); // 원본 쿼리로 복원
        break;
    }
  };

  // 선택된 인덱스가 변경될 때 검색창에 값 업데이트 (자동완성 갱신 방지)
  React.useEffect(() => {
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      // 키보드 네비게이션 시에는 자동완성을 갱신하지 않음
      setQuery(suggestions[selectedIndex]);
    }
  }, [selectedIndex, suggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setOriginalQuery(value); // 사용자 입력 시 원본 쿼리 업데이트
    setShowSuggest(true);
    setSelectedIndex(-1); // 입력 시 선택 초기화
  };

  return (
    <>
      {/* 상단: 관리도구 링크 */}
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center px-2 py-2 justify-end">
          <a href="/dashboard" className="text-xs text-gray-400 hover:underline font-medium">관리도구</a>
        </div>
        <div className="w-full h-px bg-gray-200 mb-2" />
      </div>
      
      {/* 검색창 영역 */}
      <div className="w-full max-w-7xl flex flex-col mb-2">
        <div className="relative flex items-center h-[64px]">
          <div className="flex items-center min-w-[160px] h-[64px] bg-transparent justify-start">
            {/* 로고 */}
            <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="20" r="16" fill="#2563eb"/>
              <g>
                <circle cx="24" cy="20" r="8" fill="#fff"/>
                <circle cx="27.5" cy="23.5" r="3.5" fill="#2563eb"/>
                <rect x="31" y="27" width="6" height="2" rx="1" transform="rotate(45 31 27)" fill="#2563eb"/>
              </g>
              <text x="44" y="27" fontSize="20" fontFamily="sans-serif" fill="#222" fontWeight="bold">Search</text>
            </svg>
          </div>
          
          <div className="flex-1 flex justify-center absolute left-0 right-0">
            <div className="flex flex-col gap-0 w-[480px]">
              <div className="relative flex items-center bg-white rounded-full shadow-xl border-2 border-blue-300 px-4 py-2 focus-within:ring-2 focus-within:ring-blue-400" style={{minHeight:'44px', maxHeight:'48px'}}>
                <Input
                  value={query}
                  onChange={handleInputChange}
                  onFocus={() => setShowSuggest(true)}
                  onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                  placeholder="검색어를 입력하세요"
                  className="flex-1 bg-transparent outline-none text-base px-2 py-1 text-gray-800 placeholder-gray-400 border-0 shadow-none focus:placeholder-blue-400"
                  autoComplete="off"
                  onKeyDown={handleKeyDown}
                />
                <Button 
                  className="ml-2 px-3 py-2 rounded-full text-lg font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-md flex items-center justify-center" 
                  style={{minWidth:'40px', minHeight:'40px'}} 
                  onClick={() => onSearch(query)}
                >
                  <Search />
                </Button>
                
                {/* 자동완성 드롭다운 */}
                {showSuggest && suggestions.length > 0 && (
                  <ul className="absolute inset-x-0 top-full mt-1 z-20 w-full bg-white border border-gray-200 rounded-lg shadow max-h-64 overflow-auto">
                    {suggestions.map((s, i) => (
                      <li
                        key={s + i}
                        className={`px-4 py-2 cursor-pointer text-xs leading-tight truncate ${
                          i === selectedIndex 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'hover:bg-blue-50'
                        }`}
                        onMouseDown={() => { onSearch(s); setQuery(s); }}
                        onMouseEnter={() => setSelectedIndex(i)}
                      >
                        {highlight(s, originalQuery)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* 연관검색어 */}
        {/* <div className="w-full px-6 py-2 flex items-center gap-2 text-xs bg-transparent justify-center">
          <span className="font-bold text-gray-600 mr-2">연관검색어</span>
          <span className="text-gray-200">|</span>
          <div className="flex flex-wrap gap-2">
            {relatedKeywords.map((k) => (
              <span 
                key={k} 
                className="text-black hover:underline cursor-pointer text-xs transition-colors"
                onClick={() => onSearch(k)}
              >
                {k}
              </span>
            ))}
          </div>
        </div> */}
      </div>
    </>
  );
} 