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

export function AppSidebar() {
  const location = useLocation()
  
  // 사전관리는 항상 펼쳐둔 상태로 유지
  const [expandedItems, setExpandedItems] = useState<string[]>(['dictionary'])

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
                  {item.subItems ? (
                    <>
                      <SidebarMenuButton onClick={() => toggleExpanded(item.id)} className="hover:cursor-pointer">
                        <item.icon />
                        <span>{item.title}</span>
                        <ChevronRight className={`ml-auto transition-transform duration-200 ${isExpanded(item.id) ? 'rotate-90' : ''}`} />
                      </SidebarMenuButton>
                      {isExpanded(item.id) && (
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.id}>
                              <SidebarMenuSubButton 
                                asChild
                                isActive={location.pathname === subItem.path}
                                className="hover:cursor-pointer"
                              >
                                <Link to={subItem.path} className="hover:cursor-pointer">
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </>
                  ) : (
                    <SidebarMenuButton asChild isActive={location.pathname === item.path} className="hover:cursor-pointer">
                      <Link to={item.path} className="hover:cursor-pointer">
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}