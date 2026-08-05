"use client"

import { useTransition } from "react"
import { logout } from "@/features/auth/actions"
import { LogOut } from "lucide-react"
import { cn } from "@/utils/cn"

export function LogoutButton({ className }: { className?: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
      aria-label="Sign out"
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
        "text-zinc-600 dark:text-zinc-400",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100",
        "disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
        className
      )}
    >
      <LogOut size={16} aria-hidden />
      {isPending ? "Signing out…" : "Sign out"}
    </button>
  )
}
