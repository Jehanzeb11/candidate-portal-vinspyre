"use client"
// ---------------------------------------------------------------------------
// RouteError — shared error boundary UI for (dashboard) route segments.
// Next.js 16 passes `unstable_retry` (not `reset`) to error.tsx components.
// unstable_retry re-fetches and re-renders the segment from scratch.
// ---------------------------------------------------------------------------
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RouteErrorProps {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

export function RouteError({ error, unstable_retry }: RouteErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4 text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {error.message || "An unexpected error occurred while loading this page."}
        </p>
        {error.digest && (
          <p className="text-[11px] text-muted-foreground/60 font-mono mt-1">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <Button
        onClick={unstable_retry}
        size="sm"
        className="rounded-xl gap-2"
      >
        Try again
      </Button>
    </div>
  )
}
