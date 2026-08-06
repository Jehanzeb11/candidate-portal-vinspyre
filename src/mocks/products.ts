import type { Product } from "@/types"

export const LOCAL_PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Aurora Wireless Headphones",
    price: 129.99,
    description: "Noise-canceling wireless headphones with all-day battery life.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    rating: { rate: 4.7, count: 312 },
  },
  {
    id: 2,
    title: "Minimal Leather Watch",
    price: 89.5,
    description: "A clean everyday watch with a brushed metal case and leather band.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80",
    rating: { rate: 4.5, count: 184 },
  },
  {
    id: 3,
    title: "Tailored Oxford Shirt",
    price: 64,
    description: "Smart-casual shirt with a crisp finish and soft cotton feel.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
    rating: { rate: 4.3, count: 95 },
  },
  {
    id: 4,
    title: "Everyday Tote Bag",
    price: 48.25,
    description: "Durable tote bag for work, errands, and travel essentials.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    rating: { rate: 4.6, count: 241 },
  },
  {
    id: 5,
    title: "Studio Smart Speaker",
    price: 199,
    description: "Compact smart speaker with room-filling sound and voice control.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1518441902117-f0a86f8f7d1f?auto=format&fit=crop&w=800&q=80",
    rating: { rate: 4.8, count: 128 },
  },
  {
    id: 6,
    title: "Stackable Gold Ring",
    price: 74.99,
    description: "Polished gold-tone ring designed for daily wear or layering.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=800&q=80",
    rating: { rate: 4.4, count: 67 },
  },
]

export function getLocalProducts(): Product[] {
  return LOCAL_PRODUCTS.map((product) => ({ ...product, rating: { ...product.rating } }))
}

export function getLocalProductCategories(): string[] {
  return [...new Set(LOCAL_PRODUCTS.map((product) => product.category))]
}