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
import { useLocation } from "react-router-dom"

export function AppSidebar() {
  const [expandedItems, setExpandedItems] = useState<string[]>(['dictionary'])
  const location = useLocation()

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
            <a href="#" className="flex items-center gap-2 mb-2">
              <ScanSearch className="!size-5" />
              <span className="text-base font-semibold">Search Admin</span>
            </a>
          </SidebarHeader>
          <SidebarGroupContent>
            <SidebarMenu>
              {MENU_ITEMS.map((item) => (
                <SidebarMenuItem key={item.id}>
                  {item.subItems ? (
                    <>
                      <SidebarMenuButton onClick={() => toggleExpanded(item.id)}>
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
                              >
                                <a href={subItem.path}>
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </>
                  ) : (
                    <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                      <a href={item.path}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
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