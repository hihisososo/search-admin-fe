import { Button } from "@/components/ui/button"
import { Fragment } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { getBreadcrumbsByPath } from "@/constants/menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function SiteHeader() {
  const location = useLocation()

  // 페이지 제목은 브레드크럼의 마지막 항목으로 대체됨

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex flex-col">
          <Breadcrumb>
            <BreadcrumbList className="text-base">
              {getBreadcrumbsByPath(location.pathname).map((bc, idx, arr) => (
                <Fragment key={bc.path}>
                  <BreadcrumbItem>
                    {idx < arr.length - 1 ? (
                      <BreadcrumbLink asChild>
                        <Link to={bc.path}>{bc.title}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="font-medium">{bc.title}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {idx < arr.length - 1 && (
                    <BreadcrumbSeparator />
                  )}
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
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