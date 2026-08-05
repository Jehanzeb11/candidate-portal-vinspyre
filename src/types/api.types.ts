// ---------------------------------------------------------------------------
// Shared API response types
// Use these to type the data returned by your API routes or external endpoints.
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  status: number
  message: string
  errors?: Record<string, string[]>
}
