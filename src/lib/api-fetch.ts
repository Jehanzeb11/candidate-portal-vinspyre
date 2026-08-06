// ---------------------------------------------------------------------------
// apiFetch — authenticated fetch wrapper
//
// - Adds Authorization: Bearer <token> from Zustand
// - On 401: clears session + redirects to /login immediately
// - Throws ApiError with numeric `status` so callers can inspect it
// ---------------------------------------------------------------------------
import { useAuthStore } from "@/features/auth/store"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? ""

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = "ApiError"
  }
}

function handleUnauthorized() {
  useAuthStore.getState().clearUser()
  window.location.href = "/login"
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuthStore.getState().token

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const body = await res.json().catch(() => null)

  if (res.status === 401) {
    handleUnauthorized()
    throw new ApiError(401, body?.message ?? "Unauthorized")
  }

  if (!res.ok) {
    throw new ApiError(res.status, body?.message ?? `Request failed with status ${res.status}.`)
  }

  return body as T
}
