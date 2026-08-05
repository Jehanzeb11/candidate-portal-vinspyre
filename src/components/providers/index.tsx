"use client"

import { ThemeProvider } from "next-themes"
import QueryProvider from "@/lib/query-client"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" disableTransitionOnChange>
      <QueryProvider>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </QueryProvider>
    </ThemeProvider>
  )
}
