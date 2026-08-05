// ---------------------------------------------------------------------------
// features/auth — public barrel
// Import from "@/features/auth" instead of deep paths.
// ---------------------------------------------------------------------------

// Actions (server — "use server" is declared inside the module)
export { login, logout } from "./actions"
export type { LoginResult } from "./actions"

// Validations (shared client + server)
export { LoginSchema } from "./validations"
export type { LoginInput } from "./validations"

// Client store
export { useAuthStore } from "./store"

// Components
export { LoginForm } from "./components/login-form"
export { LogoutButton } from "./components/logout-button"

// Hooks
export { useCurrentUser } from "./hooks/use-current-user"
