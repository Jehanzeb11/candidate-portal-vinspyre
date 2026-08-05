// ---------------------------------------------------------------------------
// 404 — Not Found
// Rendered by Next.js when notFound() is called or no route matches.
// ---------------------------------------------------------------------------
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"
import { APP_NAME } from "@/constants"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: `404 — Page not found | ${APP_NAME}`,
}

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Large 404 number */}
        <div className="relative">
          <p className="text-[120px] font-black leading-none text-muted/60 select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-purple-500/25">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">
            Page not found
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            The page you were looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shadow-md shadow-primary/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </main>
  )
}
