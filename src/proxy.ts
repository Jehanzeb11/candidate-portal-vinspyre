// ---------------------------------------------------------------------------
// proxy.ts — Next.js 16
//
// In Next.js 16, `middleware.ts` is deprecated and renamed to `proxy.ts`.
// The exported function must be named `proxy` (named export or default).
// Docs: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
//
// Responsibilities:
//   1. Redirect unauthenticated visitors to /login
//   2. Redirect authenticated visitors away from /login
//   3. Slide the session cookie expiry on every authenticated request
//
// Runtime: Node.js (default in Next.js 16).
// ---------------------------------------------------------------------------
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PUBLIC_PATHS, SESSION_COOKIE, SESSION_DURATION_MS } from "@/constants"
import { refreshSession } from "@/server/session"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )

  const rawToken = request.cookies.get(SESSION_COOKIE)?.value

  // ── Validate the JWT — existence alone is not enough ─────────────────────
  // refreshSession() calls decryptSession() → jwtVerify() internally.
  // A tampered, expired, or missing token yields null.
  let newToken: string | null = null
  if (rawToken) {
    newToken = await refreshSession(rawToken)
  }
  const isAuthenticated = newToken !== null

  // ── Authenticated → bounce away from /login ───────────────────────────────
  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // ── Unauthenticated → redirect to /login ─────────────────────────────────
  if (!isAuthenticated && !isPublic) {
    const url = new URL("/login", request.url)
    if (pathname !== "/") url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // ── Authenticated → slide the session cookie with the refreshed token ─────
  const response = NextResponse.next()

  if (isAuthenticated && newToken) {
    response.cookies.set(SESSION_COOKIE, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(Date.now() + SESSION_DURATION_MS),
    })
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
