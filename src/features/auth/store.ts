// ---------------------------------------------------------------------------
// Auth store — client-side cache of the current user profile
//
// Source of truth: backend login response held in client state.
// This store mirrors the current user for UI rendering.
//
// Populated by: login action after successful backend authentication
// Cleared by: logout button
//
// Not persisted to localStorage.
// ---------------------------------------------------------------------------
import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { User } from "@/types"

interface AuthState {
  user: User | null
}

interface AuthActions {
  setUser: (user: User) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }, false, "auth/setUser"),
      clearUser: () => set({ user: null }, false, "auth/clearUser"),
    }),
    { name: "AuthStore" }
  )
)
