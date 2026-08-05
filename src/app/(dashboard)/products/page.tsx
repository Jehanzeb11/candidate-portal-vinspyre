import type { Metadata } from "next"
import { Plus } from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { AddProductDialog } from "@/features/products/components/add-product-dialog"
import { ProductsClientSection } from "@/features/products/components/products-client-section"
import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/constants"
import { getProducts, getCategories } from "@/features/products/services"

export const metadata: Metadata = {
  title: `Products — ${APP_NAME}`,
  description: "Browse and manage product inventory.",
}

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Products Catalog"
        description="Comprehensive view of all store inventory, prices, and ratings."
        badge="Inventory"
      >
        <AddProductDialog>
          <Button size="sm" className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20">
            <Plus className="h-3.5 w-3.5" />
            Add Product
          </Button>
        </AddProductDialog>
      </PageHeader>

      <ProductsClientSection products={products} categories={categories} />
    </div>
  )
}
