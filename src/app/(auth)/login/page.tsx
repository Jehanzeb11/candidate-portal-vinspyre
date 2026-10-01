import type { Metadata } from "next"
import { Suspense } from "react"
import { LoginForm } from "@/features/auth/components/login-form"
import { APP_NAME } from "@/constants"
import LoginBG from "@/assets/login-bg.png"
import logo from "@/assets/white-logo.png"
import iconLogo from "@/assets/icon-logo.png"
import Image from "next/image"

export const metadata: Metadata = {
  title: `Sign In — Candidate`,
  description: "Sign in to your candidate dashboard.",
}

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
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#0a0d1a]">
      {/* Background Image */}
      <Image
        src={LoginBG}
        alt="Background"
        fill
        priority
        className="object-cover object-center pointer-events-none select-none z-0"
      />

      <div className="relative z-10 w-full max-w-[480px] flex flex-col items-center my-auto">
        {/* Top Header Logo */}
        <div className="mb-7 flex justify-center">
          <Image
            src={logo}
            alt="Vinspyre"
            width={200}
            height={48}
            className="h-14 sm:h-16 w-auto object-contain drop-shadow-md"
            priority
          />
        </div>

        {/* Card */}
        <div className="w-full bg-white text-zinc-900 rounded-[32px] shadow-2xl p-8 sm:p-10 border border-white/20">
          {/* Card Icon & Header */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-pink-50/80 flex items-center justify-center mb-4 shadow-xs">
              <Image
                src={iconLogo}
                alt="Icon"
                width={36}
                height={36}
                className="w-8 h-8 object-contain"
              />
            </div>
            <h1 className="text-2xl sm:text-[36px] font-extrabold tracking-tight text-[#0F172A]">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-slate-500 font-medium">
              Sign in to your Candidate Portal
            </p>
          </div>

          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}

