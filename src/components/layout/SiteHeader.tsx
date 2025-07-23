import { Button } from "@/components/ui/button"
import { useLocation } from 'react-router-dom'
import { getMenuByPath } from "@/constants/menu"

export function SiteHeader() {
  const location = useLocation()

  const getPageTitle = () => {
    const menuItem = getMenuByPath(location.pathname)
    return menuItem ? menuItem.title : 'Search Admin'
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <h1 className="text-base font-medium">{getPageTitle()}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a href="/search-demo" rel="noopener noreferrer" target="_blank" className="dark:text-foreground">
              데모페이지
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}