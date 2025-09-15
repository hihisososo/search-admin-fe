import { Button } from "@/components/ui/button"
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

interface BreadcrumbNavItemProps {
  path: string
  title: string
  isLast: boolean
}

function BreadcrumbNavItem({ path, title, isLast }: BreadcrumbNavItemProps) {
  return (
    <>
      <BreadcrumbItem>
        {isLast ? (
          <BreadcrumbPage className="font-medium">{title}</BreadcrumbPage>
        ) : (
          <BreadcrumbLink asChild>
            <Link to={path}>{title}</Link>
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
      {!isLast && <BreadcrumbSeparator />}
    </>
  )
}

export function SiteHeader() {
  const location = useLocation()
  const breadcrumbs = getBreadcrumbsByPath(location.pathname)

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <Breadcrumb>
          <BreadcrumbList className="text-base">
            {breadcrumbs.map((item, index) => (
              <BreadcrumbNavItem
                key={item.path}
                path={item.path}
                title={item.title}
                isLast={index === breadcrumbs.length - 1}
              />
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto">
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Link to="/search-demo" target="_blank">
              데모페이지
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
