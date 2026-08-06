import type { Metadata } from "next"
import { Suspense } from "react"
import { BarChart3, Package, Shield, Sparkles, Users } from "lucide-react"
import { LoginForm } from "@/features/auth/components/login-form"
import { APP_NAME } from "@/constants"

export const metadata: Metadata = {
  title: `Sign In — ${APP_NAME}`,
  description: "Sign in to your admin dashboard.",
}

const features = [
  { icon: BarChart3, label: "Real-time analytics & charts" },
  { icon: Package,   label: "Inventory & catalog management" },
  { icon: Users,     label: "Team access & role controls" },
  { icon: Shield,    label: "Email-only candidate sign-in" },
]

function LoginFormSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="space-y-1.5">
        <div className="h-4 w-10 rounded bg-muted" />
        <div className="h-10 rounded-lg bg-muted" />
      </div>
      <div className="h-10 rounded-lg bg-muted" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
      {/* Background decoration blur (subtle) */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-linear-to-b from-primary/5 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-[460px] bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-100 dark:border-zinc-800 shadow-xl p-8 sm:p-12 relative z-10">
        {/* Logo / Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Welcome back 👋
          </h2>
          <p className="mt-2.5 text-sm text-muted-foreground font-medium">
            Sign in to your {APP_NAME} workspace
          </p>
        </div>

        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Sign in uses your backend email login endpoint and stores the returned candidate in app state.
        </p>
      </div>
    </main>
  )
}
