// ---------------------------------------------------------------------------
// Auth store — client-side cache of the current user + auth token
//
// Persisted to localStorage so the session survives page refreshes.
// Cleared on logout.
// ---------------------------------------------------------------------------
import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import type { User, CandidateProfile } from "@/types"

interface AuthState {
  user: User | null
  /** Bearer token returned by the backend on login */
  token: string | null
  /** Full candidate profile fetched after login */
  profile: CandidateProfile | null
}

interface AuthActions {
  setUser: (user: User, token: string) => void
  setProfile: (profile: CandidateProfile) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        profile: null,
        setUser: (user, token) => set({ user, token }, false, "auth/setUser"),
        setProfile: (profile) => set({ profile }, false, "auth/setProfile"),
        clearUser: () => set({ user: null, token: null, profile: null }, false, "auth/clearUser"),
      }),
      {
        name: "auth-storage",
        // Persist user, token and profile so everything survives a page refresh
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          profile: state.profile,
        }),
      }
    ),
    { name: "AuthStore" }
  )
)
