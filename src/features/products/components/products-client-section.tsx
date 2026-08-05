"use client"

import * as React from "react"
import { Search, Plus } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProductCard } from "./product-card"
import { AddProductDialog } from "./add-product-dialog"
import { filterProducts } from "@/features/products/utils/filter-products"
import { useRole, isMutationRole } from "@/features/auth/hooks/use-role"
import type { Product } from "@/types"

interface ProductsClientSectionProps {
  products: Product[]
  categories: string[]
}

export function ProductsClientSection({ products, categories }: ProductsClientSectionProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState("all")

  const role = useRole()
  const canMutate = isMutationRole(role)

  const filtered = filterProducts(products, searchQuery, activeCategory)

  return (
    <>
      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl border-border"
            aria-label="Search products"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {/* "All Items" pill */}
          <Badge
            onClick={() => setActiveCategory("all")}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-transparent border border-border text-muted-foreground hover:bg-accent"
            }`}
          >
            All Items
          </Badge>

          {categories.map((cat) => (
            <Badge
              key={cat}
              onClick={() => setActiveCategory(cat)}
              variant="outline"
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 capitalize transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {cat}
            </Badge>
          ))}

          {canMutate && (
            <AddProductDialog>
              <Button
                size="sm"
                data-mutation-control="add-product"
                className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shrink-0 shadow-md shadow-primary/20"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Product
              </Button>
            </AddProductDialog>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <section aria-label="Products">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-48 gap-2 text-muted-foreground">
            <p className="text-sm font-medium">No products match your search.</p>
            <p className="text-xs">Try a different query or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
