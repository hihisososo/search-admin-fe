'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface MermaidGraphProps {
  graph: string
  query?: string
}

export function MermaidGraph({ graph, query = '쿼리' }: MermaidGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!graph || !isOpen) {
      return
    }

    // DOM이 준비될 때까지 대기
    const timer = setTimeout(() => {
      if (!containerRef.current) {
        return
      }
      renderGraph()
    }, 100)

    const renderGraph = async () => {
      try {
        // 초기화
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          flowchart: {
            htmlLabels: true,
            curve: 'linear',
            nodeSpacing: 50,
            rankSpacing: 80
          }
        })

        // 기존 내용 제거
        if (containerRef.current) {
          containerRef.current.innerHTML = ''
        }

        // 고유 ID 생성
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

        // JSON escape 처리 해제
        let unescapedGraph = graph
          .replace(/\\n/g, '\n')  // \n을 실제 개행으로
          .replace(/\\"/g, '"')   // \"를 "로
          .replace(/\\\\/g, '\\') // \\를 \로
        
        // Mermaid에서 지원하지 않는 화살표 문법 수정
        // ===텍스트===> 형식을 ==>|텍스트| 형식으로 변환
        unescapedGraph = unescapedGraph.replace(/===([^=]+)===>/g, '==>|$1|')
        
        // 그래프 렌더링
        const { svg } = await mermaid.render(id, unescapedGraph)
        
        // 컨테이너에 직접 SVG 설정
        if (containerRef.current && svg) {
          containerRef.current.innerHTML = svg
        }
        
        setError(null)
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        setError('그래프 렌더링 중 오류가 발생했습니다.')
        if (containerRef.current) {
          containerRef.current.innerHTML = ''
        }
      }
    }

    return () => {
      clearTimeout(timer)
    }
  }, [graph, isOpen])

  if (!graph) {
    return <span className="text-xs text-gray-400">그래프 없음</span>
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-6 px-2 text-xs"
      >
        <Eye className="h-3 w-3 mr-1" />
        토큰 그래프 보기
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              토큰 그래프 - {query}
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {error ? (
              <div className="text-sm text-red-500 p-4 bg-red-50 rounded-lg">
                {error}
              </div>
            ) : (
              <div 
                ref={containerRef} 
                className="overflow-x-auto min-h-[300px] flex items-center justify-center"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}