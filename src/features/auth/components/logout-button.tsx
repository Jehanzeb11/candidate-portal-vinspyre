"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { useAuthStore } from "@/features/auth/store"
import { cn } from "@/utils/cn"

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter()
  const clearUser = useAuthStore((s) => s.clearUser)

  async function handleLogout() {
    // Clear the auth store (user, token, profile)
    clearUser()
    
    // Clear localStorage to remove persisted auth data
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-storage")
      localStorage.clear()
    }
    
    // Redirect to login page
    await router.push("/login")
    
    // Refresh the page to clear any cached data
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      aria-label="Sign out"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium cursor-pointer bg-border w-full",
        "text-zinc-600 dark:text-zinc-400",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100",
        "transition-colors",
        className
      )}
    >
      <LogOut size={16} aria-hidden />
      Sign out
    </button>
  )
}
