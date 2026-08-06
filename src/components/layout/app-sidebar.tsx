"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  Settings,
  User
} from "lucide-react"

import logo from "@/assets/logo.png"
import iconLogo from "@/assets/icon-logo.png"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { APP_NAME } from "@/constants"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { useAuthStore } from "@/features/auth/store"

const navMain = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Profile", url: "/profile", icon: User },
    ],
  },
  // {
  //   title: "Management",
  //   items: [
  //     { title: "Products", url: "/products", icon: Package, badge: "20+" },
  //     { title: "Users",    url: "/users",    icon: Users },
  //   ],
  // },
  // {
  //   title: "System",
  //   items: [
  //     { title: "Settings", url: "/settings", icon: Settings },
  //   ],
  // },
]

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)

  const displayName  = profile?.fullName ?? user?.name  ?? "Candidate"
  const displayEmail = profile?.email    ?? user?.email ?? ""
  const initials     = getInitials(displayName)

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar backdrop-blur-md"
      {...props}
    >
      {/* ── Logo ──────────────────────────────────── */}
      <SidebarHeader className="h-16 flex justify-center px-3 border-b border-sidebar-border/60">
        <Link href="/" className="flex  w-full">
          {/* Full logo — visible when sidebar is expanded */}
          <Image
            src={logo}
            alt="Logo"
            width={140}
            height={40}
            className="object-contain group-data-[collapsible=icon]:hidden"
            priority
          />
          {/* Icon logo — visible when sidebar is collapsed */}
          <Image
            src={iconLogo}
            alt="Logo"
            width={32}
            height={32}
            className="object-contain hidden group-data-[collapsible=icon]:block"
            priority
          />
        </Link>
      </SidebarHeader>

      {/* ── Navigation ────────────────────────────── */}
      <SidebarContent className="px-2 py-4 space-y-6">
        {navMain.map((group) => (
          <SidebarGroup key={group.title} className="px-0">
            <SidebarGroupLabel className="px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase group-data-[collapsible=icon]:hidden">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-1">
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.url ||
                    (item.url !== "/" && pathname.startsWith(item.url))
                  const Icon = item.icon

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={<Link href={item.url} />}
                        isActive={isActive}
                        tooltip={item.title}
                        className={`mb-2 w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 font-semibold"
                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                            isActive ? "scale-110" : ""
                          }`}
                        />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* ── User footer ───────────────────────────── */}
      <SidebarFooter className="border-t border-sidebar-border/60 p-3">
        <div className="flex items-center justify-between gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden overflow-hidden">
            <Avatar className="h-9 w-9 shrink-0 border border-primary/25">
              <AvatarFallback className="bg-linear-to-br from-primary to-pink-600 text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-sidebar-foreground truncate">
                {displayName}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {displayEmail}
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <LogoutButton />
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
