// ---------------------------------------------------------------------------
// User types — matches the shape returned by GET /auth/me on the backend
// ---------------------------------------------------------------------------

export type UserRole = "admin" | "manager" | "user" | "viewer"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  createdAt?: string
}
