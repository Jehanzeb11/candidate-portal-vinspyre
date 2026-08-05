"use client"

import * as React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { CalendarIcon, Download, Zap, Target, RefreshCw } from "lucide-react"
import { format } from "date-fns"

import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useAnalytics } from "@/features/analytics/hooks/use-analytics"

export default function AnalyticsPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [popoverOpen, setPopoverOpen] = React.useState(false)

  const { data, isLoading } = useAnalytics()

  const weeklyData = data?.weekly ?? []
  const kpi = data?.kpi

  const handleDownload = () => {
    toast.success("Telemetry report generated!", {
      description: `Report exported for period ending ${date ? format(date, "PP") : "Today"}.`,
    })
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Analytics & Insights"
        description="Detailed breakdown of sales velocity, visitor traffic, and performance telemetry."
        badge="Analytics Overview"
      >
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger
            render={
              <Button variant="outline" size="sm" className="gap-2 rounded-xl text-xs font-semibold">
                <CalendarIcon className="h-3.5 w-3.5 text-purple-600" />
                {date ? format(date, "PPP") : "Select Date"}
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0 rounded-2xl" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                setDate(d)
                setPopoverOpen(false)
                toast.info(`Filtered telemetry data for ${d ? format(d, "PP") : "selected date"}`)
              }}
            />
          </PopoverContent>
        </Popover>

        <Button
          onClick={handleDownload}
          size="sm"
          className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20"
        >
          <Download className="h-3.5 w-3.5" />
          Download Report
        </Button>
      </PageHeader>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-sm p-5 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Average Order Value</span>
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <span className="text-2xl font-extrabold text-foreground">
                  ${kpi?.averageOrderValue.toFixed(2)}
                </span>
              )}
              <span className="text-xs font-semibold text-emerald-600">+5.4%</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Target $135.00 reached</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-sm p-5 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Customer Retention</span>
              <Target className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <span className="text-2xl font-extrabold text-foreground">
                  {kpi?.customerRetention}%
                </span>
              )}
              <span className="text-xs font-semibold text-emerald-600">+3.1%</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">High repeat customer rate</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-sm p-5 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Cart Checkout Rate</span>
              <RefreshCw className="h-4 w-4 text-pink-500" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <span className="text-2xl font-extrabold text-foreground">
                  {kpi?.cartCheckoutRate}%
                </span>
              )}
              <span className="text-xs font-semibold text-emerald-600">+1.8%</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Streamlined checkout UX</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Sales Bar Chart */}
        <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Weekly Sales ($)</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Daily revenue totals for the active week</CardDescription>
          </CardHeader>
          <CardContent>
            {!isLoading ? (
              <div className="h-70 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(161, 161, 170, 0.2)" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "rgba(24, 24, 27, 0.9)", borderRadius: "12px", color: "#fff" }}
                      formatter={(val) => [`$${Number(val ?? 0).toLocaleString()}`, "Sales"] as [string, string]}
                    />
                    <Bar dataKey="sales" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-70 w-full rounded-xl bg-muted animate-pulse" />
            )}
          </CardContent>
        </Card>

        {/* Visitor Traffic Line Chart */}
        <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Visitor Volume</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Unique store sessions per day</CardDescription>
          </CardHeader>
          <CardContent>
            {!isLoading ? (
              <div className="h-70 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(161, 161, 170, 0.2)" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "rgba(24, 24, 27, 0.9)", borderRadius: "12px", color: "#fff" }}
                      formatter={(val) => [Number(val ?? 0).toLocaleString(), "Visitors"] as [string, string]}
                    />
                    <Line type="monotone" dataKey="visitors" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-70 w-full rounded-xl bg-muted animate-pulse" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
