// ---------------------------------------------------------------------------
// Auth store — client-side cache of the current user profile
//
// Source of truth:  httpOnly session cookie (server) + backend /auth/me
// This store:       mirrors the profile on the client for UI rendering
//
// Populated by:     useCurrentUser hook after a successful /auth/me fetch
// Cleared by:       logout
//
// NOT persisted to localStorage — the server session is the authority.
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
