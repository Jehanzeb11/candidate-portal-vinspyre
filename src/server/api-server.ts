import "server-only"
import { request, type RequestOptions } from "./api-client"
import { getSession } from "./session"

// ─── Server-side client (reads session cookie) ───────────────────────────────
// Import only in Server Components, Server Actions, and Route Handlers.

function makeServerClient() {
  async function getToken(): Promise<string | undefined> {
    const session = await getSession()
    return session?.accessToken
  }

  return {
    get: async <T>(path: string, opts?: RequestOptions) =>
      request<T>("GET", path, { ...opts, token: await getToken() }),

    post: async <T, B = unknown>(path: string, body?: B, opts?: RequestOptions<B>) =>
      request<T, B>("POST", path, { ...opts, body, token: await getToken() }),

    put: async <T, B = unknown>(path: string, body?: B, opts?: RequestOptions<B>) =>
      request<T, B>("PUT", path, { ...opts, body, token: await getToken() }),

    patch: async <T, B = unknown>(path: string, body?: B, opts?: RequestOptions<B>) =>
      request<T, B>("PATCH", path, { ...opts, body, token: await getToken() }),

    delete: async <T>(path: string, opts?: RequestOptions) =>
      request<T>("DELETE", path, { ...opts, token: await getToken() }),
  }
}

export const apiServer = makeServerClient()
