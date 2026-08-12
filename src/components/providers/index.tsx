"use client"

import { ThemeProvider } from "next-themes"
import QueryProvider from "@/lib/query-client"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" disableTransitionOnChange>
      <QueryProvider>
        {children}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          toastOptions={{
            classNames: {
              toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-950 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg",
              success: "group toast group-[.toaster]:bg-green-900 group-[.toaster]:text-white group-[.toaster]:border-green-800",
              error: "group toast group-[.toaster]:bg-red-900 group-[.toaster]:text-white group-[.toaster]:border-red-800",
              actionButton: "group-[.toaster]:bg-slate-900 group-[.toaster]:text-slate-50",
            },
          }}
        />
      </QueryProvider>
    </ThemeProvider>
  )
}
