import Image from "next/image"
import { Star } from "lucide-react"
import type { Product } from "@/features/products/services"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group flex flex-col bg-card/90 rounded-3xl border border-border/70 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 overflow-hidden">
      {/* Image container */}
      <div className="relative h-56 w-full bg-linear-to-b from-muted/50 to-muted/30 p-6 flex items-center justify-center overflow-hidden">
        <div className="relative h-full w-full group-hover:scale-105 transition-transform duration-300">
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-2 drop-shadow-sm"
          />
        </div>

        {/* Category Pill */}
        <Badge className="absolute top-3 left-3 bg-card/90 backdrop-blur-md text-primary border border-primary/20 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
          {product.category}
        </Badge>
      </div>

      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Title */}
        <h2 className="text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {product.title}
        </h2>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Footer: Price + Rating */}
        <div className="flex items-center justify-between pt-3 border-t border-border/60 mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Price</span>
            <span className="text-lg font-extrabold text-foreground">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-xl border border-amber-200/60 dark:border-amber-800/40 text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span className="font-bold text-amber-900 dark:text-amber-300">
              {product.rating.rate}
            </span>
            <span className="text-[10px] text-amber-700/70 dark:text-amber-400/70">
              ({product.rating.count})
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
