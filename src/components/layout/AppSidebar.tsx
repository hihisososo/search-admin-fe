import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { ScanSearch, ChevronRight } from "lucide-react"
import { MENU_ITEMS } from "@/constants/menu"
import { useState } from "react"
import { useLocation, Link } from "react-router-dom"
import type { MenuItem as MenuItemType, SubMenuItem } from "@/constants/menu"

interface MenuItemProps {
  item: MenuItemType
  isExpanded: boolean
  onToggle: () => void
  currentPath: string
}

function MenuItem({ item, isExpanded, onToggle, currentPath }: MenuItemProps) {
  if (!item.subItems) {
    return (
      <SidebarMenuButton asChild isActive={currentPath === item.path}>
        <Link to={item.path}>
          <item.icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    )
  }

  return (
    <>
      <SidebarMenuButton onClick={onToggle}>
        <item.icon />
        <span>{item.title}</span>
        <ChevronRight
          className={`ml-auto transition-transform duration-200 ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
      </SidebarMenuButton>
      {isExpanded && (
        <SubMenuItems subItems={item.subItems} currentPath={currentPath} />
      )}
    </>
  )
}

interface SubMenuItemsProps {
  subItems: SubMenuItem[]
  currentPath: string
}

function SubMenuItems({ subItems, currentPath }: SubMenuItemsProps) {
  return (
    <SidebarMenuSub>
      {subItems.map((subItem) => (
        <SidebarMenuSubItem key={subItem.id}>
          <SidebarMenuSubButton
            asChild
            isActive={currentPath === subItem.path}
          >
            <Link to={subItem.path}>
              <span>{subItem.title}</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      ))}
    </SidebarMenuSub>
  )
}

export function AppSidebar() {
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const isExpanded = (itemId: string) => expandedItems.includes(itemId)

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarHeader>
            <Link to="/dashboard" className="flex items-center gap-2 mb-2">
              <ScanSearch className="!size-5" />
              <span className="text-base font-semibold">Search Admin</span>
            </Link>
          </SidebarHeader>
          <SidebarGroupContent>
            <SidebarMenu>
              {MENU_ITEMS.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <MenuItem
                    item={item}
                    isExpanded={isExpanded(item.id)}
                    onToggle={() => toggleExpanded(item.id)}
                    currentPath={location.pathname}
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
