"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  Bell,
  ChevronRight,
  CheckCheck,
  Clock,
} from "lucide-react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { useAuthStore } from "@/features/auth/store"
import { useCurrentUser } from "@/features/auth/hooks/use-current-user"
import { getNotifications } from "@/mocks/notifications"

// Derives initials from a display name
function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

// Page title map for clean breadcrumbs
const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/analytics": "Analytics",
  "/products": "Products",
  "/users": "Users",
  "/settings": "Settings",
}

export function AppHeader() {
  const pathname = usePathname()
  const [notifications, setNotifications] = React.useState(() => getNotifications())
  const unreadCount = notifications.filter((n) => n.unread).length

  // Sync user from /api/auth/me into Zustand on mount
  useCurrentUser()
  const user = useAuthStore((s) => s.user)

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))

  const pageTitle =
    PAGE_TITLES[pathname] ??
    (pathname.split("/").filter(Boolean)[0]
      ? pathname.split("/").filter(Boolean)[0].charAt(0).toUpperCase() +
        pathname.split("/").filter(Boolean)[0].slice(1)
      : "Dashboard")

  const displayName = user?.name ?? "Admin"
  const displayRole = user?.role ?? "administrator"
  const initials = getInitials(displayName)

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/80 px-4 sm:px-6 backdrop-blur-md transition-all">
      {/* ── Left: Sidebar toggle + breadcrumb ─────── */}
      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger
            render={
              <SidebarTrigger className="h-9 w-9 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground" />
            }
          />
          <TooltipContent side="bottom" className="text-xs">
            Toggle Sidebar
          </TooltipContent>
        </Tooltip>

        <div className="h-4 w-px bg-border hidden sm:block" />

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm font-medium">
          <span className="text-muted-foreground hidden sm:inline-block">Panel</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground/60 hidden sm:inline-block" />
          <span className="text-foreground font-semibold capitalize">{pageTitle}</span>
        </nav>
      </div>

      {/* ── Right: actions + user pill ─────────────── */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
                )}
              </Button>
            }
          />
          <PopoverContent
            className="w-80 p-4 rounded-2xl border-border bg-popover shadow-xl shadow-black/10"
            align="end"
            sideOffset={8}
          >
            <PopoverHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <PopoverTitle className="text-sm font-bold text-foreground">
                  Notifications
                </PopoverTitle>
                {unreadCount > 0 && (
                  <Badge className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full border-0">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={markAllRead}
                  className="text-[11px] text-primary hover:text-primary/80 h-7 px-2"
                >
                  <CheckCheck className="h-3 w-3 mr-1" /> Mark read
                </Button>
              )}
            </PopoverHeader>

            <div className="divide-y divide-border/50 py-1 max-h-72 overflow-y-auto">
              {notifications.map((n) => {
                const IconComponent = n.icon
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 py-3 px-1 transition-colors rounded-xl ${
                      n.unread ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${n.color}`}>
                      <IconComponent className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center shrink-0">
                          <Clock className="h-2.5 w-2.5 mr-0.5" />
                          {n.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                        {n.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <Separator className="my-2" />
            <Button
              variant="ghost"
              className="w-full text-xs text-muted-foreground hover:text-foreground h-8 rounded-xl"
            >
              View all notifications
            </Button>
          </PopoverContent>
        </Popover>

        <div className="h-5 w-px bg-border" />

        {/* User pill */}
        <div className="flex items-center gap-2 pl-1">
          <Avatar className="h-8 w-8 ring-2 ring-primary/20">
            <AvatarFallback className="bg-linear-to-tr from-purple-600 to-indigo-600 text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground leading-tight">
              {displayName}
            </span>
            <span className="text-[10px] text-primary font-medium capitalize">
              {displayRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
