// (dashboard)/layout.tsx — Server Component
// Renders the full sidebar + header shell for all dashboard routes.
// AppSidebar and AppHeader are Client Components; this layout itself
// carries no "use client" directive — this is the standard Next.js 16 pattern.
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="flex min-h-screen flex-col bg-muted/30 transition-colors">
        <AppHeader />
        <main className="flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 animate-in">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
