"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, User, LogOut } from "lucide-react"

import logo from "@/assets/logo.png"
import iconLogo from "@/assets/icon-logo.png"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuthStore } from "@/features/auth/store"
import { cn } from "@/utils/cn"

// ─── Nav config ──────────────────────────────────────────────────────────────

const navItems = [
  { title: "Dashboard", url: "/",        icon: LayoutDashboard },
  { title: "Profile",   url: "/profile", icon: User },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router   = useRouter()
  const user     = useAuthStore((s) => s.user)
  const profile  = useAuthStore((s) => s.profile)
  const clearUser = useAuthStore((s) => s.clearUser)

  const displayName  = profile?.fullName ?? user?.name  ?? "Candidate"
  const displayEmail = profile?.email    ?? user?.email ?? ""
  const initials     = getInitials(displayName)

  const handleLogout = async () => {
    clearUser()
    if (typeof window !== "undefined") localStorage.clear()
    await router.push("/login")
    router.refresh()
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar"
      {...props}
    >
      {/* ── Logo ── */}
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border/60 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
        <Link href="/" className="flex items-center">
          <Image
            src={logo}
            alt="Logo"
            width={130}
            height={36}
            className="object-contain group-data-[collapsible=icon]:hidden"
            priority
          />
          <Image
            src={iconLogo}
            alt="Logo"
            width={28}
            height={28}
            className="object-contain hidden group-data-[collapsible=icon]:block"
            priority
          />
        </Link>
      </SidebarHeader>

      {/* ── Nav ── */}
      <SidebarContent className="px-2 py-4">
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive =
              item.url === "/"
                ? pathname === "/"
                : pathname === item.url || pathname.startsWith(item.url + "/")
            const Icon = item.icon

            return (
              <Link
                key={item.url}
                href={item.url}
                title={item.title}
                className={cn(
                  // Expanded: full-width row
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                  // Collapsed: small centred icon square — override sizing
                  "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4.5 w-4.5 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80"
                  )}
                />
                <span className="group-data-[collapsible=icon]:hidden">
                  {item.title}
                </span>
              </Link>
            )
          })}
        </nav>
      </SidebarContent>

      {/* ── User footer ── */}
      <SidebarFooter className="border-t border-sidebar-border/60 p-3 group-data-[collapsible=icon]:p-2">

        {/* Expanded: full user row */}
        <div className="group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-sidebar-accent transition-colors cursor-default">
            {/* Avatar with green online dot */}
            <div className="relative shrink-0">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-linear-to-br from-primary to-pink-600 text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
            </div>

            {/* Name + email */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-sidebar-foreground leading-tight truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                {displayEmail}
              </p>
            </div>

            {/* Logout icon */}
            <button
              onClick={handleLogout}
              title="Sign out"
              className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Collapsed: avatar + logout stacked, both centred */}
        <div className="hidden group-data-[collapsible=icon]:flex flex-col items-center gap-2">
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-linear-to-br from-primary to-pink-600 text-white text-[10px] font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
