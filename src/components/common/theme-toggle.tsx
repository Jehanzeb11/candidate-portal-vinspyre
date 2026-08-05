"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Only render after mount to avoid hydration mismatch
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-xl bg-muted/50 animate-pulse" />
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={`h-9 w-9 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${className ?? ""}`}
          >
            {isDark ? (
              <Sun className="h-4 w-4 transition-transform duration-300 rotate-0 scale-100" />
            ) : (
              <Moon className="h-4 w-4 transition-transform duration-300 rotate-0 scale-100" />
            )}
          </Button>
        }
      />
      <TooltipContent side="bottom" className="text-xs">
        {isDark ? "Light mode" : "Dark mode"}
      </TooltipContent>
    </Tooltip>
  )
}
