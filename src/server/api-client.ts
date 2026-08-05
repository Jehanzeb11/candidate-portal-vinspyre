// ---------------------------------------------------------------------------
// API Client — Browser & Universal Client
//
// Usage in Client Components (via TanStack Query):
//   import { apiClient } from "@/server/api-client"
//   const data = await apiClient.get<Product[]>("/products")
//
// For Server Components / Server Actions, use:
//   import { apiServer } from "@/server/api-server"
// ---------------------------------------------------------------------------

import type { ApiError } from "@/types"

// ─── Constants ───────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""

// ─── Error class ─────────────────────────────────────────────────────────────

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: ApiError
  ) {
    super(body.message ?? statusText)
    this.name = "ApiRequestError"
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface RequestOptions<TBody = unknown> {
  params?: Record<string, string | number | boolean | null | undefined>
  body?: TBody
  headers?: Record<string, string>
  /** Next.js server-only cache option — ignored on the client */
  next?: NextFetchRequestConfig
}

// ─── Core fetch ──────────────────────────────────────────────────────────────

export async function request<TResponse, TBody = unknown>(
  method: HttpMethod,
  path: string,
  options: RequestOptions<TBody> & { token?: string } = {}
): Promise<TResponse> {
  const { params, body, headers: extraHeaders, next, token } = options

  const url = new URL(`${API_BASE}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v != null) url.searchParams.set(k, String(v))
    })
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...extraHeaders,
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
    ...(next ? { next } : {}),
  })

  if (!res.ok) {
    let errorBody: ApiError = { status: res.status, message: res.statusText }
    try {
      errorBody = await res.json()
    } catch {
      // Response body is not JSON — keep the default
    }
    throw new ApiRequestError(res.status, res.statusText, errorBody)
  }

  if (res.status === 204) return undefined as TResponse
  return res.json() as Promise<TResponse>
}

// ─── Browser client ───────────────────────────────────────────────────────────
// Fetches the token once, caches it in memory with a 4-minute TTL,
// then reuses it for subsequent requests. This avoids a /api/auth/token
// round-trip on every single query.

interface TokenCache {
  value: string
  expiresAt: number
}

let _tokenCache: TokenCache | null = null
const TOKEN_TTL_MS = 4 * 60 * 1000 // 4 minutes

async function getBrowserToken(): Promise<string | undefined> {
  const now = Date.now()

  if (_tokenCache && _tokenCache.expiresAt > now) {
    return _tokenCache.value
  }

  try {
    const res = await fetch("/api/auth/token", { credentials: "include" })
    if (!res.ok) {
      _tokenCache = null
      return undefined
    }
    const json = (await res.json()) as { accessToken?: string }
    if (!json.accessToken) return undefined

    _tokenCache = { value: json.accessToken, expiresAt: now + TOKEN_TTL_MS }
    return _tokenCache.value
  } catch {
    _tokenCache = null
    return undefined
  }
}

/** Call this after logout to immediately invalidate the cached token. */
export function invalidateBrowserTokenCache(): void {
  _tokenCache = null
}

function makeBrowserClient() {
  return {
    get: async <T>(path: string, opts?: RequestOptions) =>
      request<T>("GET", path, { ...opts, token: await getBrowserToken() }),

    post: async <T, B = unknown>(path: string, body?: B, opts?: RequestOptions<B>) =>
      request<T, B>("POST", path, { ...opts, body, token: await getBrowserToken() }),

    put: async <T, B = unknown>(path: string, body?: B, opts?: RequestOptions<B>) =>
      request<T, B>("PUT", path, { ...opts, body, token: await getBrowserToken() }),

    patch: async <T, B = unknown>(path: string, body?: B, opts?: RequestOptions<B>) =>
      request<T, B>("PATCH", path, { ...opts, body, token: await getBrowserToken() }),

    delete: async <T>(path: string, opts?: RequestOptions) =>
      request<T>("DELETE", path, { ...opts, token: await getBrowserToken() }),
  }
}

export const apiClient = makeBrowserClient()
