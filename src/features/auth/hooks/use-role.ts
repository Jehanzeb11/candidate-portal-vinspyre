"use client"
// ---------------------------------------------------------------------------
// useRole — reads the current user's role from the auth store.
// Defaults to "viewer" when no user is authenticated (null-safe).
// ---------------------------------------------------------------------------
import { useAuthStore } from "@/features/auth/store"
import type { UserRole } from "@/types"

export function useRole(): UserRole {
  return useAuthStore((s) => s.user?.role ?? "viewer")
}

/**
 * Returns true for roles that may perform write/mutation operations.
 * All other roles (user, viewer) are read-only.
 */
export function isMutationRole(role: UserRole): boolean {
  return role === "admin" || role === "manager"
}
