"use client"
// ---------------------------------------------------------------------------
// useCurrentUser
//
// Reads the current user from Zustand so the layout can stay wired the same way.
// ---------------------------------------------------------------------------
import { useAuthStore } from "@/features/auth/store"

export function useCurrentUser() {
  return useAuthStore((s) => s.user)
}
