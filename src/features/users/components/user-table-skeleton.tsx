import { Skeleton } from "@/components/ui/skeleton"

export function UserTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Control bar skeleton */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-3xl border border-border/70 bg-card/80">
        <Skeleton className="h-9 w-80 rounded-2xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-3xl border border-border/70 bg-card/80 overflow-hidden">
        {/* Header row */}
        <div className="flex items-center gap-4 px-4 py-3.5 bg-muted/50 border-b border-border/70">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="ml-auto h-4 w-14" />
        </div>

        {/* 5 placeholder rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3 border-b border-border/40 last:border-0"
          >
            {/* Avatar + name/email */}
            <div className="flex items-center gap-3 w-80">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-2.5 w-40" />
              </div>
            </div>
            {/* Role badge */}
            <Skeleton className="h-5 w-16 rounded-full" />
            {/* Status badge */}
            <Skeleton className="h-5 w-14 rounded-full" />
            {/* Date */}
            <Skeleton className="h-3 w-20" />
            {/* Action buttons */}
            <div className="ml-auto flex gap-1">
              <Skeleton className="h-8 w-8 rounded-xl" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
