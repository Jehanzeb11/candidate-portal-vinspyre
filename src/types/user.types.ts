// ---------------------------------------------------------------------------
// User types — normalized candidate shape used by the app
// ---------------------------------------------------------------------------

export type UserRole = "admin" | "manager" | "user" | "viewer"

export interface LatestApplication {
  id: string
  jobId: string
  positionAppliedFor: string
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  avatarUrl?: string
  createdAt?: string
  latestApplication?: LatestApplication
}
