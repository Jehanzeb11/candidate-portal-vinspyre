"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"

import { LoginSchema, type LoginInput } from "@/features/auth/validations"
import { useAuthStore } from "@/features/auth/store"
import type { User, LatestApplication } from "@/types"
import { cn } from "@/utils/cn"
import { Button } from "@/components/ui/button"

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string
  id: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-500 uppercase"
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600 font-medium">
          {error}
        </p>
      )}
    </div>
  )
}

const inputBase = cn(
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 sm:py-3 text-sm font-medium",
  "text-slate-900 placeholder:text-slate-400",
  "focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/10",
  "disabled:opacity-60 disabled:cursor-not-allowed transition-all"
)

// ─── Component ────────────────────────────────────────────────────────────────

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/"

  const setUser = useAuthStore((s) => s.setUser)
  const setPasswordUpdated = useAuthStore((s) => s.setPasswordUpdated)

  const [showPassword, setShowPassword] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onValid(data: LoginInput) {
    setIsPending(true)
    setServerError(null)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "")
      const response = await fetch(`${baseUrl}/recruitment/candidate-profile/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      })

      const body = await response.json().catch(() => null)

      if (!response.ok) {
        const fieldErrors = (body as { errors?: Record<string, string> })?.errors
        if (fieldErrors?.email) setError("email", { type: "server", message: fieldErrors.email })
        if (fieldErrors?.password) setError("password", { type: "server", message: fieldErrors.password })
        if (!fieldErrors?.email && !fieldErrors?.password) {
          setServerError((body as { message?: string })?.message ?? "Unable to sign in.")
        }
        return
      }

      // ── Parse response ──────────────────────────────────────────────────
      const d = (body as { data?: Record<string, unknown> })?.data ?? {}

      const token = typeof d.accessToken === "string" ? d.accessToken : null
      if (!token) { setServerError("Login succeeded but token is missing."); return }

      const c = d.candidate as Record<string, unknown> | undefined
      if (!c) { setServerError("Login succeeded but candidate data is missing."); return }

      const first = typeof c.firstName === "string" ? c.firstName : ""
      const last = typeof c.lastName === "string" ? c.lastName : ""
      const user: User = {
        id: typeof c.id === "string" ? c.id : "",
        name: `${first} ${last}`.trim(),
        email: typeof c.email === "string" ? c.email : "",
        phone: typeof c.phone === "string" ? c.phone : undefined,
        role: "viewer",
      }

      const app = d.latestApplication as Record<string, unknown> | undefined
      if (app) {
        const latestApplication: LatestApplication = {
          id: typeof app.id === "string" ? app.id : "",
          jobId: typeof app.jobId === "string" ? app.jobId : "",
          positionAppliedFor: typeof app.positionAppliedFor === "string" ? app.positionAppliedFor : "",
        }
        user.latestApplication = latestApplication
      }

      const isPasswordUpdated = d.isPasswordUpdated === true

      setUser(user, token)
      setPasswordUpdated(isPasswordUpdated)
      router.push(callbackUrl)
      router.refresh()
    } catch {
      setServerError("Unable to reach the authentication server.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-5" noValidate>

      {/* Server error banner */}
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
        >
          <svg className="mt-0.5 size-4 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM7.25 4.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5Zm.75 7a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75Z" />
          </svg>
          {serverError}
        </div>
      )}

      {/* Email */}
      <Field label="EMAIL ADDRESS" id="email" error={errors.email?.message}>
        <div className="relative flex items-center">
          <Mail className="absolute left-3.5 size-4 text-slate-400 pointer-events-none" />
          <input
            {...register("email")}
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            disabled={isPending}
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={!!errors.email}
            className={cn(
              inputBase,
              "pl-10",
              errors.email
                ? "border-red-400 focus:ring-red-500"
                : "border-slate-200"
            )}
          />
        </div>
      </Field>

      {/* Password */}
      <Field label="PASSWORD" id="password" error={errors.password?.message}>
        <div className="relative flex items-center">
          <Lock className="absolute left-3.5 size-4 text-slate-400 pointer-events-none" />
          <input
            {...register("password")}
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={isPending}
            aria-describedby={errors.password ? "password-error" : undefined}
            aria-invalid={!!errors.password}
            className={cn(
              inputBase,
              "pl-10 pr-10",
              errors.password
                ? "border-red-400 focus:ring-red-500"
                : "border-slate-200"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </Field>

      {/* Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full rounded-2xl text-sm sm:text-base font-bold h-12 sm:h-14"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden />
              Signing In…
            </>
          ) : (
            <>
              Sign In to Portal
              <ArrowRight size={16} className="ml-0.5" />
            </>
          )}
        </Button>
      </div>

    </form>
  )
}
