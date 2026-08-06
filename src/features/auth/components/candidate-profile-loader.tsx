"use client"
// ---------------------------------------------------------------------------
// CandidateProfileLoader
//
// Calls useCandidateProfile on mount so the GET /recruitment/candidate-profile
// request fires and is visible in the browser Network tab.
// Renders a simple summary of the returned data.
// ---------------------------------------------------------------------------
import { useCandidateProfile } from "@/features/auth/hooks/use-candidate-profile"

export function CandidateProfileLoader() {
  const { data, isLoading, isError, error } = useCandidateProfile()

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading profile…</p>
  }

  if (isError) {
    return (
      <p className="text-sm text-red-500">
        Failed to load profile: {error.message}
      </p>
    )
  }

  if (!data) return null

  return (
    <div className="rounded-lg border p-4 text-sm space-y-1">
      <p className="font-semibold text-base">{data.fullName}</p>
      <p className="text-muted-foreground">{data.email}</p>
      {data.phone && <p className="text-muted-foreground">{data.phone}</p>}
    </div>
  )
}
