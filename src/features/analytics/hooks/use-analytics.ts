"use client"
// ---------------------------------------------------------------------------
// useAnalytics — dual-mode data hook for the analytics page.
// IS_DEMO_MODE → returns mock data; production → hits /analytics endpoint.
// ---------------------------------------------------------------------------
import { useQuery } from "@tanstack/react-query"
import { IS_DEMO_MODE } from "@/constants"
import { apiClient } from "@/server/api-client"
import { getWeeklyMetrics, getKpiMetrics } from "@/mocks/analytics"
import type { WeeklyMetric, KpiMetrics } from "@/mocks/analytics"

export type { WeeklyMetric, KpiMetrics }

interface AnalyticsData {
  weekly: WeeklyMetric[]
  kpi: KpiMetrics
}

const analyticsQueryKey = ["analytics", "dashboard"] as const

export function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: analyticsQueryKey,
    queryFn: () =>
      IS_DEMO_MODE
        ? Promise.resolve({ weekly: getWeeklyMetrics(), kpi: getKpiMetrics() })
        : apiClient.get<AnalyticsData>("/analytics"),
    staleTime: 5 * 60 * 1000,
  })
}
