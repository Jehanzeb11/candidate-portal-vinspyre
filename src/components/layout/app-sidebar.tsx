"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { LayoutGrid, User, LogOut, Sparkles, ArrowRight } from "lucide-react"

import logo from "@/assets/white-logo.png"
import iconLogo from "@/assets/icon-logo.png"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/features/auth/store"
import { cn } from "@/utils/cn"

// ─── Nav config ──────────────────────────────────────────────────────────────

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutGrid },
  { title: "My Profile", url: "/profile", icon: User },
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
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const clearUser = useAuthStore((s) => s.clearUser)

  const displayName = profile?.fullName ?? user?.name ?? "Candidate"
  const displayEmail = profile?.email ?? user?.email ?? "Candidate"
  const initials = getInitials(displayName)

  const handleLogout = async () => {
    clearUser()
    if (typeof window !== "undefined") localStorage.clear()
    await router.push("/login")
    router.refresh()
  }

  return (
    <Sidebar
      collapsible="icon"
      className="text-white"
      style={{ background: 'linear-gradient(155.84deg, #101F45 33.12%, #172B5A 78.46%)' }}
      {...props}
    >
      {/* ── Logo ── */}
      <SidebarHeader
        style={{ background: '#101F45' }}
        className="h-[75px] flex items-center px-6 pt-4 pb-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
        <Link href="/" className="flex items-center">
          <Image
            src={logo}
            alt="Logo"
            width={160}
            height={60}
            className="object-contain group-data-[collapsible=icon]:hidden"
            priority
          />
          <Image
            src={iconLogo}
            alt="Logo"
            width={48}
            height={48}
            className="object-contain hidden group-data-[collapsible=icon]:block"
            priority
          />
        </Link>
      </SidebarHeader>

      {/* ── Nav ── */}
      <SidebarContent
        style={{ background: 'linear-gradient(155.84deg, #101F45 33.12%, #172B5A 78.46%)' }}

        className="px-4 py-6 flex flex-col gap-6">
        <div className="flex flex-col">
          <h4 className="px-3 mb-3 text-[11px] font-bold uppercase tracking-wider text-white group-data-[collapsible=icon]:hidden">
            My Space
          </h4>
          <nav className="flex flex-col gap-1.5">
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
                    "flex items-center gap-3.5 rounded-[14px] px-4 py-3.5 text-[14.5px] font-medium transition-colors duration-150",
                    // Collapsed: small centred icon square
                    "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center",
                    isActive
                      ? "bg-[#E9327C] text-white shadow-sm"
                      : "text-white hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive ? "text-white" : "text-white/90 group-hover:text-white"
                    )}
                  />
                  <span className="group-data-[collapsible=icon]:hidden">
                    {item.title}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* ── Need a hand Card ── */}
        <div className="mt-auto group-data-[collapsible=icon]:hidden mb-2">
          <div className="bg-[#0D1B3E] rounded-3xl p-5 relative overflow-hidden border border-white/5 shadow-lg">
            {/* Decorative arcs */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full border-[1px] border-white/10" />

            <div className="flex w-10 h-10 bg-[#E9327C] rounded-xl items-center justify-center mb-4">
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            <h5 className="text-[15px] font-medium text-white mb-2">Need a hand?</h5>
            <p className="text-[13px] text-slate-300/80 leading-relaxed mb-5">
              Our people team is here to support your journey.
            </p>

            <Link href="mailto:support@vinspyre.com" className="flex items-center gap-2 text-[13px] text-white hover:text-white/80 transition-colors">
              Get in touch
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </SidebarContent>

      {/* ── User footer ── */}
      <SidebarFooter
        style={{ background: 'linear-gradient(155.84deg, #172B5A 78.46%, #1C356B 93.05%)' }}

        className="border-t border-white/10 p-4 group-data-[collapsible=icon]:p-2 relative">
        {/* Expanded: full user row */}
        <div className="group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-3 p-1 rounded-xl cursor-default">
            {/* Avatar */}
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`} alt={displayName} />
              <AvatarFallback className="bg-linear-to-br from-primary to-pink-600 text-white text-sm font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Name + email */}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-white leading-tight truncate">
                {displayName}
              </p>
              <p className="text-[12px] text-slate-400 truncate mt-0.5">
                Candidate
              </p>
            </div>

            {/* Logout icon */}
            <button
              onClick={handleLogout}
              title="Sign out"
              className="shrink-0 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        {/* Collapsed: avatar + logout stacked */}
        <div className="hidden group-data-[collapsible=icon]:flex flex-col items-center gap-3 my-2">
          <Avatar className="h-8 w-8 border-2 border-primary">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`} alt={displayName} />
            <AvatarFallback className="bg-linear-to-br from-primary to-pink-600 text-white text-[10px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>

      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

