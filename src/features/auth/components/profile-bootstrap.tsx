"use client"
// ---------------------------------------------------------------------------
// ProfileBootstrap
//
// Mounted inside the dashboard layout to fire the candidate profile API
// call exactly once per session. The result is saved into the auth store
// so all child components (AppHeader, AppSidebar) read it from there.
// Renders nothing — purely a data-fetching side-effect component.
// ---------------------------------------------------------------------------
import { useCandidateProfile } from "@/features/auth/hooks/use-candidate-profile"

export function ProfileBootstrap() {
  useCandidateProfile()
  return null
}
