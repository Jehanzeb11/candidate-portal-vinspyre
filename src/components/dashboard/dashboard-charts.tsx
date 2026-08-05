"use client"

import * as React from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TrendingUp, PieChart as PieIcon } from "lucide-react"

const revenueData = [
  { month: "Jan", revenue: 14200, orders: 320 },
  { month: "Feb", revenue: 18400, orders: 410 },
  { month: "Mar", revenue: 22100, orders: 480 },
  { month: "Apr", revenue: 26800, orders: 590 },
  { month: "May", revenue: 34500, orders: 710 },
  { month: "Jun", revenue: 48290, orders: 890 },
]

const categoryData = [
  { name: "Electronics", value: 45, color: "#E6366F" },
  { name: "Clothing", value: 30, color: "#10b981" },
  { name: "Jewelery", value: 15, color: "#3b82f6" },
  { name: "Accessories", value: 10, color: "#8b5cf6" },
]

export function DashboardCharts() {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-85 rounded-3xl bg-muted animate-pulse" />
        <div className="h-85 rounded-3xl bg-muted animate-pulse" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Revenue Area Chart */}
      <Card className="lg:col-span-2 rounded-3xl border-border/70 bg-card/80 backdrop-blur-md shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-border/60 mb-2">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Revenue Growth Stream
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Monthly gross revenue over the current 6-month cycle
            </CardDescription>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
            +28.4% YoY
          </span>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-67.5 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E6366F" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#E6366F" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(161, 161, 170, 0.15)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#888" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#888" }} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(24, 24, 27, 0.95)",
                    borderColor: "rgba(63, 63, 70, 0.5)",
                    borderRadius: "16px",
                    color: "#fff",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                  }}
                formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, "Revenue"] as [string, string]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#E6366F" strokeWidth={3} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Share Pie Chart */}
      <Card className="rounded-3xl border-border/70 bg-card/80 backdrop-blur-md shadow-sm">
        <CardHeader className="pb-2 border-b border-border/60 mb-2">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-primary" />
            Category Share
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Sales volume breakdown by product segment
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-47.5 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(24, 24, 27, 0.95)",
                    borderRadius: "16px",
                    color: "#fff",
                  }}
                formatter={(val) => [`${val ?? 0}%`, "Share"] as [string, string]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2 bg-muted/50 p-2 rounded-xl border border-border/50">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-muted-foreground truncate">{cat.name}</span>
                <span className="font-bold text-foreground ml-auto">{cat.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
