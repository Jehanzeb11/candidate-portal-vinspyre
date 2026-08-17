"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api-fetch"
import { queryKeys } from "@/lib/query-keys"
import ENDPOINTS from "@/server/Endpoints"
import type { OnboardingAssignment, OnboardingProgressPayload, CandidateOnboarding } from "@/types/candidate.types"

// ─── Fetch all onboarding assignments ─────────────────────────────────────

export function useOnboarding() {
  return useQuery<OnboardingAssignment[], Error>({
    queryKey: queryKeys.onboarding.list,
    queryFn: async () => {
      try {
        const res = await apiFetch<{ 
          success: boolean; 
          data: {
            id: string;
            candidateProfileId: string;
            assignedContents: OnboardingAssignment[];
            // ... other onboarding fields
          }
        }>(
          ENDPOINTS.GET_ONBOARDING
        )
        
        // Debug logging
        console.log('Onboarding API Response:', res)
        
        const data = res.data
        
        // The API returns an object with assignedContents array
        if (data && data.assignedContents && Array.isArray(data.assignedContents)) {
          return data.assignedContents
        }
        
        console.warn('Onboarding API returned unexpected data format:', data)
        return []
      } catch (error) {
        console.error('Failed to fetch onboarding assignments:', error)
        throw error
      }
    },
    staleTime: 0,
    retry: false,
  })
}

// ─── Update progress ───────────────────────────────────────────────────────

export function useUpdateOnboardingProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      contentId,
      payload,
    }: {
      contentId: string
      payload: OnboardingProgressPayload
    }) => {
      return apiFetch<{ success: boolean; data: OnboardingAssignment }>(
        ENDPOINTS.UPDATE_ONBOARDING_PROGRESS(contentId),
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      )
    },
    onSuccess: () => {
      // Refetch onboarding list to get updated progress
      void queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.list })
    },
  })
}

// ─── Mark complete ─────────────────────────────────────────────────────────

export function useCompleteOnboardingContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (contentId: string) => {
      return apiFetch<{ success: boolean; data: OnboardingAssignment }>(
        ENDPOINTS.COMPLETE_ONBOARDING_CONTENT(contentId),
        { method: "PUT" }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.list })
    },
  })
}
