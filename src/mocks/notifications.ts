// ---------------------------------------------------------------------------
// Notifications mock service
// Swap-point: IS_DEMO_MODE === true → return this data.
// Production: replace useState lazy initialiser with useQuery in AppHeader.
// ---------------------------------------------------------------------------
import { Package, ShieldAlert, UserPlus, type LucideIcon } from "lucide-react"

export interface Notification {
  id: string
  title: string
  desc: string
  time: string
  icon: LucideIcon
  unread: boolean
  color: string  // Tailwind class string e.g. "text-purple-500 bg-purple-100"
}

export function getNotifications(): Notification[] {
  return [
    {
      id: "1",
      title: "New Inventory Restock",
      desc: "20 units of Wireless Earbuds added.",
      time: "5m ago",
      icon: Package,
      unread: true,
      color: "text-purple-500 bg-purple-100 dark:bg-purple-950/60",
    },
    {
      id: "2",
      title: "User Role Elevated",
      desc: "Sarah Chen assigned Manager role.",
      time: "1h ago",
      icon: UserPlus,
      unread: true,
      color: "text-indigo-500 bg-indigo-100 dark:bg-indigo-950/60",
    },
    {
      id: "3",
      title: "Security Telemetry Alert",
      desc: "Successful admin session login.",
      time: "3h ago",
      icon: ShieldAlert,
      unread: false,
      color: "text-emerald-500 bg-emerald-100 dark:bg-emerald-950/60",
    },
  ]
}
