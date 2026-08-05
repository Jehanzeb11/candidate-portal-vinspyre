"use client"
// ---------------------------------------------------------------------------
// TanStack Query hooks for the /users resource
// Dual-mode: IS_DEMO_MODE → optimistic cache mutations; production → real API.
// ---------------------------------------------------------------------------
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/server/api-client"
import { queryKeys } from "@/lib/query-keys"
import { IS_DEMO_MODE } from "@/constants"
import type { User } from "@/types"

// ─── GET list ────────────────────────────────────────────────────────────────

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: () => apiClient.get<User[]>("/users"),
  })
}

// ─── GET single ──────────────────────────────────────────────────────────────

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => apiClient.get<User>(`/users/${id}`),
    enabled: Boolean(id),
  })
}

// ─── CREATE ──────────────────────────────────────────────────────────────────

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<User, "id" | "createdAt">) =>
      apiClient.post<User, typeof payload>("/users", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  })
}

// ─── UPDATE ──────────────────────────────────────────────────────────────────

export function useUpdateUser(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Omit<User, "id" | "createdAt">>) => {
      if (IS_DEMO_MODE) {
        // Optimistic cache update — no real network call in demo mode.
        const current = qc.getQueryData<User[]>(queryKeys.users.list()) ?? []
        const updated = current.map((u) =>
          u.id === id ? { ...u, ...payload } : u
        )
        qc.setQueryData(queryKeys.users.list(), updated)
        return Promise.resolve({ id, ...payload } as User)
      }
      return apiClient.patch<User, typeof payload>(`/users/${id}`, payload)
    },
    onSuccess: () => {
      if (!IS_DEMO_MODE) {
        qc.invalidateQueries({ queryKey: queryKeys.users.detail(id) })
        qc.invalidateQueries({ queryKey: queryKeys.users.all })
      }
    },
  })
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => {
      if (IS_DEMO_MODE) {
        // Optimistic cache update — filter the user out of the list.
        const current = qc.getQueryData<User[]>(queryKeys.users.list()) ?? []
        const filtered = current.filter((u) => u.id !== id)
        qc.setQueryData(queryKeys.users.list(), filtered)
        return Promise.resolve()
      }
      return apiClient.delete<void>(`/users/${id}`)
    },
    onSuccess: () => {
      if (!IS_DEMO_MODE) {
        qc.invalidateQueries({ queryKey: queryKeys.users.all })
      }
    },
  })
}
