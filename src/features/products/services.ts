// ---------------------------------------------------------------------------
// Products — local data fetching service
// Plain async functions called directly in Server Components.
// ---------------------------------------------------------------------------
import type { Product } from "@/types"
import { getLocalProductCategories, getLocalProducts } from "@/mocks/products"

export type { Product, ProductRating } from "@/types"

async function apiFetch<T>(resolver: () => T): Promise<T> {
  return Promise.resolve(resolver())
}

export const getProducts = () => apiFetch<Product[]>(() => getLocalProducts())
export const getProduct = (id: number) => apiFetch<Product>(() => getLocalProducts().find((product) => product.id === id) as Product)
export const getProductsByCategory = (category: string) =>
  apiFetch<Product[]>(() => getLocalProducts().filter((product) => product.category === category))
export const getCategories = () => apiFetch<string[]>(() => getLocalProductCategories())
