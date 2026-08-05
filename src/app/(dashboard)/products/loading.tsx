import { ProductGridSkeleton } from "@/features/products/components/product-grid-skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 pb-10">
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-72 rounded bg-muted animate-pulse" />
      </div>
      <ProductGridSkeleton />
    </div>
  )
}
