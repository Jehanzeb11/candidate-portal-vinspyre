// ---------------------------------------------------------------------------
// Query Key Factory
// Centralised, typed query keys for TanStack Query.
// ---------------------------------------------------------------------------

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },

  users: {
    all: ["users"] as const,
    list: (filters?: Record<string, unknown>) => ["users", "list", filters] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },

  products: {
    all: ["products"] as const,
    list: () => ["products", "list"] as const,
    detail: (id: number) => ["products", "detail", id] as const,
    byCategory: (category: string) => ["products", "category", category] as const,
    categories: ["products", "categories"] as const,
  },
} as const
