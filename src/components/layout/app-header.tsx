"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { Bell, CheckCheck, Clock, User as UserIcon, LogOut } from "lucide-react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuthStore } from "@/features/auth/store"
import { getNotifications } from "@/mocks/notifications"
import Link from "next/link"

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

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

  // Read everything from the global store — populated by the login action
  const profile = useAuthStore((s) => s.profile)
  const user = useAuthStore((s) => s.user)
  const clearUser = useAuthStore((s) => s.clearUser)
  const router = useRouter()

  const displayName = profile?.fullName ?? user?.name ?? "Roary Watson"
  const initials = getInitials(displayName)

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))

  const pageTitle =
    PAGE_TITLES[pathname] ??
    (pathname.split("/").filter(Boolean)[0]
      ? pathname.split("/").filter(Boolean)[0].charAt(0).toUpperCase() +
      pathname.split("/").filter(Boolean)[0].slice(1)
      : "Overview")

  // For hydration safety, we only render the date on the client
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E91E8C87] bg-[#D630690D] px-4 sm:px-6 transition-all">
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

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm font-medium">
          <span className="text-foreground md:inline hidden">Candidate portal</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground h-3.5 w-3.5 md:inline hidden"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="text-foreground">{pageTitle}</span>
        </nav>
      </div>

      {/* ── Right: actions + user pill ─────────────── */}
      <div className="flex items-center gap-4 sm:gap-6">

        {/* Date */}
        <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
            <path d="M8 14h.01" />
            <path d="M12 14h.01" />
            <path d="M16 14h.01" />
            <path d="M8 18h.01" />
            <path d="M12 18h.01" />
            <path d="M16 18h.01" />
          </svg>
          <span>{mounted ? currentDate : "Loading..."}</span>
        </div>


        <div className="h-8 w-[2px] bg-black hidden sm:block" />

        {/* User pill */}
        <Popover>
          <PopoverTrigger>
            <button className="flex items-center gap-3 cursor-pointer outline-none hover:bg-black/5 p-1 -m-1 rounded-xl transition-colors text-left">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-pink-100 text-[#1f2937] text-xs font-bold tracking-wider">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground">
                  {displayName}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-foreground/60"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-1 rounded-2xl shadow-xl shadow-pink-500/5 border-pink-100 bg-white/80 backdrop-blur-xl">
            <div className="px-3 pt-2">
              <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email ?? "Candidate"}</p>
            </div>
            <Separator className="bg-pink-100/50" />
            <div className="flex flex-col gap-0.5">
              <Link
                href="/profile"
                className="flex items-center gap-2.5 w-full p-3 text-sm text-foreground rounded-xl hover:bg-pink-50 hover:text-pink-600 transition-all font-medium"
              >
                <UserIcon className="h-4 w-4" />
                Profile
              </Link>
              <button
                onClick={() => {
                  clearUser();
                  router.push("/login");
                }}
                className="cursor-pointer flex items-center gap-2.5 w-full p-3 text-sm text-red-600 rounded-xl hover:bg-red-50 transition-all font-medium text-left"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </PopoverContent>
        </Popover>

      </div>
    </header>
  )
}
