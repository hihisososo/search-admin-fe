import { Home, Inbox, Calendar, Search } from "lucide-react"

export interface MenuItem {
  id: string
  title: string
  path: string
  icon: any
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    title: '대시보드',
    path: '/dashboard',
    icon: Home,
  },
  {
    id: 'index',
    title: '색인관리',
    path: '/index',
    icon: Inbox,
  },
  {
    id: 'dictionary',
    title: '사전관리',
    path: '/dictionary',
    icon: Calendar,
  },
  {
    id: 'search-simulator',
    title: '검색시뮬레이터',
    path: '/search-simulator',
    icon: Search,
  }
]

// 헬퍼 함수들
export const getMenuByPath = (path: string) => {
  return MENU_ITEMS.find(item => item.path === path)
}

export const getMenuById = (id: string) => {
  return MENU_ITEMS.find(item => item.id === id)
} 