import { Home, Calendar, Search, Rocket, FileText, Target } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface MenuItem {
  id: string
  title: string
  path: string
  icon: LucideIcon
  subItems?: SubMenuItem[]
}

export interface SubMenuItem {
  id: string
  title: string
  path: string
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    title: '대시보드',
    path: '/dashboard',
    icon: Home,
  },
  {
    id: 'dictionary',
    title: '사전관리',
    path: '/dictionary',
    icon: Calendar,
    subItems: [
      {
        id: 'user-dictionary',
        title: '사용자사전',
        path: '/dictionary/user'
      },
      {
        id: 'synonym-dictionary',
        title: '동의어사전',
        path: '/dictionary/synonym'
      },
      {
        id: 'stopword-dictionary',
        title: '불용어사전',
        path: '/dictionary/stopword'
      },
      {
        id: 'unit-dictionary',
        title: '단위명사전',
        path: '/dictionary/unit'
      },
      {
        id: 'typo-dictionary',
        title: '오타교정사전',
        path: '/dictionary/typo'
      },
      {
        id: 'category-ranking-dictionary',
        title: '카테고리랭킹사전',
        path: '/dictionary/category-ranking'
      },
      {
        id: 'morpheme-analysis',
        title: '형태소분석',
        path: '/dictionary/morpheme-analysis'
      }
    ]
  },
  {
    id: 'search-logs',
    title: '검색로그',
    path: '/search-logs',
    icon: FileText,
  },
  {
    id: 'deploy',
    title: '색인관리',
    path: '/deploy',
    icon: Rocket,
  },
  {
    id: 'search-simulator',
    title: '검색시뮬레이터',
    path: '/search-simulator',
    icon: Search,
    subItems: [
      {
        id: 'search-simulator-product',
        title: '상품검색',
        path: '/search-simulator'
      },
      {
        id: 'search-simulator-autocomplete',
        title: '자동완성',
        path: '/search-simulator/autocomplete'
      }
    ]
  },
  {
    id: 'search-evaluation',
    title: '검색평가',
    path: '/search-evaluation',
    icon: Target,
    subItems: [
      {
        id: 'answer-set-management',
        title: '정답셋관리',
        path: '/search-evaluation/answer-set'
      },
      {
        id: 'evaluation-execution',
        title: '평가실행',
        path: '/search-evaluation/execution'
      }
    ]
  }
]

export const getMenuByPath = (path: string) => {
  const mainMenu = MENU_ITEMS.find(item => item.path === path)
  if (mainMenu) return mainMenu

  for (const item of MENU_ITEMS) {
    if (item.subItems) {
      const subMenu = item.subItems.find(sub => sub.path === path)
      if (subMenu) {
        return {
          ...item,
          title: subMenu.title,
          path: subMenu.path
        }
      }
    }
  }
  
  return undefined
}


export interface BreadcrumbEntry {
  title: string
  path: string
}

export const getBreadcrumbsByPath = (path: string): BreadcrumbEntry[] => {
  for (const item of MENU_ITEMS) {
    if (item.path === path) {
      return [{ title: item.title, path: item.path }]
    }

    // 서브메뉴 확인
    if (item.subItems) {
      const subMenu = item.subItems.find(sub => sub.path === path)
      if (subMenu) {
        return [
          { title: item.title, path: item.path },
          { title: subMenu.title, path: subMenu.path },
        ]
      }

      // 부분 경로 일치 (예: /dictionary/user/123)
      const matchedSub = item.subItems.find(sub => path.startsWith(sub.path))
      if (matchedSub) {
        return [
          { title: item.title, path: item.path },
          { title: matchedSub.title, path: matchedSub.path },
        ]
      }
    }

    if (path.startsWith(item.path)) {
      return [{ title: item.title, path: item.path }]
    }
  }

  return []
}