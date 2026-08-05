"use client"
// ---------------------------------------------------------------------------
// useCurrentUser
//
// Fetches the current user from /api/auth/me and syncs the result into Zustand.
// ---------------------------------------------------------------------------
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { queryKeys } from "@/lib/query-keys"
import { useAuthStore } from "@/features/auth/store"
import type { User } from "@/types"

async function fetchMe(): Promise<User> {
  const res = await fetch("/api/auth/me", { credentials: "include" })
  if (!res.ok) throw new Error("Unauthenticated")
  return res.json() as Promise<User>
}

export function useCurrentUser() {
  const setUser = useAuthStore((s) => s.setUser)
  const clearUser = useAuthStore((s) => s.clearUser)

  const query = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: fetchMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (query.data) setUser(query.data)
    if (query.isError) clearUser()
  }, [query.data, query.isError, setUser, clearUser])

  return query
}
