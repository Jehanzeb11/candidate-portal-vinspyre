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
  token: string | null
  profile: CandidateProfile | null
  /** False when the backend requires the user to set a new password */
  isPasswordUpdated: boolean
}

interface AuthActions {
  setUser: (user: User, token: string) => void
  setProfile: (profile: CandidateProfile) => void
  setPasswordUpdated: (value: boolean) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        profile: null,
        isPasswordUpdated: true,
        setUser: (user, token) => set({ user, token }, false, "auth/setUser"),
        setProfile: (profile) => set({ profile }, false, "auth/setProfile"),
        setPasswordUpdated: (value) => set({ isPasswordUpdated: value }, false, "auth/setPasswordUpdated"),
        clearUser: () => set({ user: null, token: null, profile: null, isPasswordUpdated: true }, false, "auth/clearUser"),
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          profile: state.profile,
          isPasswordUpdated: state.isPasswordUpdated,
        }),
      }
    ),
    { name: "AuthStore" }
  )
)
