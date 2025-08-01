import { Home, Calendar, Search, Rocket, FileText, Target, LucideIcon } from "lucide-react"

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
        title: '유의어사전',
        path: '/dictionary/synonym'
      },
      {
        id: 'stopword-dictionary',
        title: '불용어사전',
        path: '/dictionary/stopword'
      },
      {
        id: 'typo-dictionary',
        title: '오타교정사전',
        path: '/dictionary/typo'
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
    title: '배포관리',
    path: '/deploy',
    icon: Rocket,
  },
  {
    id: 'search-simulator',
    title: '검색시뮬레이터',
    path: '/search-simulator',
    icon: Search,
  },
  {
    id: 'search-evaluation',
    title: '검색평가',
    path: '/search-evaluation',
    icon: Target,
    subItems: [
      {
        id: 'answer-set-management',
        title: '평가셋관리',
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

// 헬퍼 함수들
export const getMenuByPath = (path: string) => {
  // 먼저 메인 메뉴에서 찾기
  const mainMenu = MENU_ITEMS.find(item => item.path === path)
  if (mainMenu) return mainMenu

  // 서브 메뉴에서 찾기
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

export const getMenuById = (id: string) => {
  return MENU_ITEMS.find(item => item.id === id)
} 