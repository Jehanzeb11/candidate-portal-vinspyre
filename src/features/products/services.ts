// ---------------------------------------------------------------------------
// Products — server-side data fetching service
// Plain async functions called directly in Server Components.
// Swap PRODUCTS_BASE_URL (via PRODUCTS_API_BASE_URL env var) for your real backend.
// ---------------------------------------------------------------------------
import type { Product } from "@/types"
import { PRODUCTS_BASE_URL } from "@/constants"

export type { Product, ProductRating } from "@/types"

async function apiFetch<T>(path: string, revalidate = 60): Promise<T> {
  const res = await fetch(`${PRODUCTS_BASE_URL}${path}`, {
    next: { revalidate },
  })
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText} — ${PRODUCTS_BASE_URL}${path}`)
  }
  return res.json() as Promise<T>
}

export const getProducts = () => apiFetch<Product[]>("/products")
export const getProduct = (id: number) => apiFetch<Product>(`/products/${id}`)
export const getProductsByCategory = (category: string) =>
  apiFetch<Product[]>(`/products/category/${encodeURIComponent(category)}`)
export const getCategories = () => apiFetch<string[]>("/products/categories", 3600)
