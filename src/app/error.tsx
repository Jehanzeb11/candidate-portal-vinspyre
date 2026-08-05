"use client"
// ---------------------------------------------------------------------------
// Global error boundary — catches uncaught errors in the React tree.
// Next.js requires this to be a Client Component.
// ---------------------------------------------------------------------------
import { useEffect } from "react"
import { RefreshCw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to your error monitoring service (Sentry, Datadog, etc.) here
    console.error("[GlobalError]", error)
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. Our team has been notified.
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-muted-foreground/60 font-mono bg-muted inline-block px-2.5 py-1 rounded-lg">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <Button
          onClick={reset}
          className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold shadow-md shadow-primary/20"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    </main>
  )
}
