"use client"
// ---------------------------------------------------------------------------
// TanStack Query hooks for the local users resource.
// ---------------------------------------------------------------------------
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { getLocalUsers } from "@/mocks/users"
import type { User } from "@/types"

function getUsersKey() {
  return queryKeys.users.list()
}

function getSeedUsers(): User[] {
  return getLocalUsers()
}

function makeUser(payload: Omit<User, "id" | "createdAt">): User {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString().slice(0, 10),
    ...payload,
  }
}

// ─── GET list ────────────────────────────────────────────────────────────────

export function useUsers() {
  return useQuery({
    queryKey: getUsersKey(),
    queryFn: async () => getSeedUsers(),
    initialData: getSeedUsers(),
  })
}

// ─── GET single ──────────────────────────────────────────────────────────────

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => getSeedUsers().find((user) => user.id === id) as User,
    enabled: Boolean(id),
  })
}

// ─── CREATE ──────────────────────────────────────────────────────────────────

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<User, "id" | "createdAt">) =>
      Promise.resolve(makeUser(payload)),
    onSuccess: (created) => {
      qc.setQueryData<User[]>(getUsersKey(), (current = []) => [created, ...current])
      qc.setQueryData(queryKeys.users.detail(created.id), created)
    },
  })
}

// ─── UPDATE ──────────────────────────────────────────────────────────────────

export function useUpdateUser(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Omit<User, "id" | "createdAt">>) => {
      const current = qc.getQueryData<User[]>(getUsersKey()) ?? getSeedUsers()
      const existing = current.find((user) => user.id === id)
      return Promise.resolve({
        ...(existing ?? makeUser({ name: "", email: "", role: "viewer" })),
        ...payload,
        id,
      } as User)
    },
    onSuccess: (updated) => {
      qc.setQueryData<User[]>(getUsersKey(), (current = []) =>
        current.map((user) => (user.id === id ? { ...user, ...updated } : user))
      )
      qc.setQueryData(queryKeys.users.detail(id), updated)
    },
  })
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => Promise.resolve(id),
    onSuccess: (_id) => {
      qc.setQueryData<User[]>(getUsersKey(), (current = []) => current.filter((user) => user.id !== id))
      qc.removeQueries({ queryKey: queryKeys.users.detail(id) })
    },
  })
}
