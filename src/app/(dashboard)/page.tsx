import { Suspense } from "react"
import {
  Users,
  Package,
  DollarSign,
  ArrowUpRight,
  Plus,
  Download,
  Activity,
  Sparkles,
} from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { ProductGrid } from "@/features/products/components/product-grid"
import { ProductGridSkeleton } from "@/features/products/components/product-grid-skeleton"
import { AddProductDialog } from "@/features/products/components/add-product-dialog"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const kpiCards = [
  {
    label:    "Total Gross Revenue",
    value:    "$48,290.00",
    change:   "+14.2%",
    sub:      "vs. $42,300 previous period",
    icon:     DollarSign,
    positive: true,
    iconBg:   "bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400",
    badgeBg:  "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/40",
    shadow:   "hover:shadow-rose-500/5",
  },
  {
    label:    "Active Users",
    value:    "2,840",
    change:   "+8.1%",
    sub:      "+210 new active accounts",
    icon:     Users,
    positive: true,
    iconBg:   "bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400",
    badgeBg:  "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/40",
    shadow:   "hover:shadow-blue-500/5",
  },
  {
    label:    "Catalog Products",
    value:    "240",
    change:   "Active",
    sub:      "Across 4 major categories",
    icon:     Package,
    positive: null,
    iconBg:   "bg-pink-100 dark:bg-pink-950/70 text-pink-600 dark:text-pink-400",
    badgeBg:  "text-primary dark:text-primary bg-primary/10 border-primary/20",
    shadow:   "hover:shadow-pink-500/5",
  },
  {
    label:    "Conversion Rate",
    value:    "3.42%",
    change:   "+0.5%",
    sub:      "Optimal store conversion",
    icon:     Activity,
    positive: true,
    iconBg:   "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400",
    badgeBg:  "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/40",
    shadow:   "hover:shadow-emerald-500/5",
  },
]

export default function HomePage() {
  return (
    <div className="space-y-8 pb-10">
      {/* ── Hero welcome banner ─────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-rose-950 via-pink-950 to-zinc-950 p-6 sm:p-8 text-white shadow-xl shadow-pink-950/15 border border-primary/25">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-linear-to-br from-primary/30 to-pink-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 h-48 w-48 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/30 hover:bg-primary/40 text-rose-200 border border-primary/30 text-xs px-3 py-0.5 rounded-full backdrop-blur-md">
                <Sparkles className="h-3 w-3 mr-1 text-rose-300" />
                Enterprise Panel v2.0
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, Admin 👋
            </h1>
            <p className="text-xs sm:text-sm text-rose-100/80 leading-relaxed">
              Your store catalog performance is up{" "}
              <span className="font-semibold text-emerald-300">+14.2%</span> this month. Review
              live inventory, metrics, and team access.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-white/20 text-white bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-semibold"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download Report
            </Button>
            <AddProductDialog>
              <Button
                size="sm"
                className="rounded-xl bg-linear-to-r from-primary to-pink-500 text-white text-xs font-semibold shadow-lg shadow-primary/30 hover:opacity-95"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add New Item
              </Button>
            </AddProductDialog>
          </div>
        </div>
      </div>

      {/* ── KPI Metric cards ───────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, change, sub, icon: Icon, iconBg, badgeBg, shadow }) => (
          <Card
            key={label}
            className={`rounded-3xl border-border/70 bg-card/80 backdrop-blur-md p-5 shadow-sm hover:shadow-xl ${shadow} hover:-translate-y-0.5 transition-all group`}
          >
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${iconBg} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-foreground">{value}</span>
                <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                  {change} <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Revenue charts ────────────────────────── */}
      <DashboardCharts />

      {/* ── Product catalog highlights ─────────────── */}
      <div className="space-y-4 pt-2">
        <PageHeader
          title="Inventory Highlights"
          description="Live items streaming from the backend catalog service."
        >
          <AddProductDialog>
            <Button
              size="sm"
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold gap-2 shadow-md shadow-primary/20"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Product
            </Button>
          </AddProductDialog>
        </PageHeader>

        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid />
        </Suspense>
      </div>
    </div>
  )
}
