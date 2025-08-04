import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { SiteHeader } from "./SiteHeader"
import { Toaster } from "@/components/ui/toaster"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <SiteHeader />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}