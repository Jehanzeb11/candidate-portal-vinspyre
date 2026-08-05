// ---------------------------------------------------------------------------
// filterProducts — pure function, no side-effects.
// Used by ProductsClientSection for live filtering.
// ---------------------------------------------------------------------------
import type { Product } from "@/types"

/**
 * Filter a product list by search query and/or category.
 *
 * @param products  The full product list to filter.
 * @param query     Case-insensitive substring match against title and category.
 *                  Empty string → no text filter applied.
 * @param category  Category name to match exactly (case-insensitive).
 *                  "all" → no category filter applied.
 * @returns         A subset of `products` satisfying both filters.
 */
export function filterProducts(
  products: Product[],
  query: string,
  category: string
): Product[] {
  const q = query.trim().toLowerCase()
  const cat = category.toLowerCase()

  return products.filter((p) => {
    const matchesQuery =
      q === "" ||
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)

    const matchesCategory =
      cat === "all" || p.category.toLowerCase() === cat

    return matchesQuery && matchesCategory
  })
}
