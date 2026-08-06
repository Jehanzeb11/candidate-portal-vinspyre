"use client"
// ---------------------------------------------------------------------------
// useAnalytics — local analytics data hook for the analytics page.
// ---------------------------------------------------------------------------
import { useQuery } from "@tanstack/react-query"
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
    queryFn: async () => ({ weekly: getWeeklyMetrics(), kpi: getKpiMetrics() }),
    staleTime: 5 * 60 * 1000,
  })
}
