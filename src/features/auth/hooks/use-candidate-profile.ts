"use client"
import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/features/auth/store"
import { apiFetch } from "@/lib/api-fetch"
import { queryKeys } from "@/lib/query-keys"
import type { CandidateProfile } from "@/types"

export function useCandidateProfile() {
  const token = useAuthStore((s) => s.token ?? "")
  const email = useAuthStore((s) => s.user?.email ?? "")
  const setProfile = useAuthStore((s) => s.setProfile)
  const setPasswordUpdated = useAuthStore((s) => s.setPasswordUpdated)

  const query = useQuery<CandidateProfile, Error>({
    queryKey: queryKeys.auth.candidateProfile(email),
    queryFn: async () => {
      const body = await apiFetch<{ data: CandidateProfile }>("/recruitment/candidate-profile/me")
      return body.data
    },
    enabled: Boolean(token),
    staleTime: 0,          // always refetch on every dashboard visit
    retry: false,
  })

  useEffect(() => {
    if (query.data) {
      setProfile(query.data)
      // Update password status based on API response
      if (typeof query.data.isPasswordUpdated === 'boolean') {
        setPasswordUpdated(query.data.isPasswordUpdated)
      }
    }
  }, [query.data, setProfile, setPasswordUpdated])

  return query
}
