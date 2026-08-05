import { UserTableSkeleton } from "@/features/users/components/user-table-skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 pb-10">
      <div className="space-y-2">
        <div className="h-7 w-56 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-80 rounded bg-muted animate-pulse" />
      </div>
      <UserTableSkeleton />
    </div>
  )
}
