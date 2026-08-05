"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 1 minute — avoids redundant refetches
        // when navigating between pages that share the same query key.
        staleTime: 60 * 1000,
        // Retry once on failure; most transient errors resolve in one retry.
        retry: 1,
        // Panels/dashboards don't need aggressive window-focus refetching.
        refetchOnWindowFocus: false,
      },
    },
  })
}

// Module-level singleton for the browser.
// A new client is created per server request (SSR) to prevent cross-request
// data leakage. On the browser one instance is reused for the full session.
let browserQueryClient: QueryClient | undefined

function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: always return a fresh instance so requests never share state.
    return makeQueryClient()
  }
  // Browser: reuse the existing instance, or create it on first call.
  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState ensures the same client instance is used across re-renders
  // without relying solely on the module-level variable during SSR hydration.
  const [queryClient] = useState(getQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
