// ---------------------------------------------------------------------------
// Analytics mock service
// Owns the canonical demo data for the analytics page.
// Swap IS_DEMO_MODE → false to route through apiClient instead.
// ---------------------------------------------------------------------------

export interface WeeklyMetric {
  day: string       // "Mon" | "Tue" | … | "Sun"
  sales: number     // positive integer, dollars
  visitors: number  // positive integer
}

export interface KpiMetrics {
  averageOrderValue: number   // > 0, dollars
  customerRetention: number   // 0 < x ≤ 100, percentage
  cartCheckoutRate: number    // 0 < x ≤ 100, percentage
}

const WEEKLY_DATA: WeeklyMetric[] = [
  { day: "Mon", sales: 4200,  visitors: 1200 },
  { day: "Tue", sales: 5800,  visitors: 1600 },
  { day: "Wed", sales: 7100,  visitors: 2100 },
  { day: "Thu", sales: 6400,  visitors: 1850 },
  { day: "Fri", sales: 9200,  visitors: 2800 },
  { day: "Sat", sales: 11400, visitors: 3400 },
  { day: "Sun", sales: 8900,  visitors: 2600 },
]

const KPI_DATA: KpiMetrics = {
  averageOrderValue: 142.50,
  customerRetention: 68.4,
  cartCheckoutRate:  82.1,
}

export function getWeeklyMetrics(): WeeklyMetric[] {
  return WEEKLY_DATA
}

export function getKpiMetrics(): KpiMetrics {
  return KPI_DATA
}
