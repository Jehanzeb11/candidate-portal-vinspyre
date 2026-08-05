// ---------------------------------------------------------------------------
// GET /api/auth/token
//
// Returns the access token from the sealed session cookie to same-origin
// client-side code (used by apiClient to attach Authorization headers).
//
// Security notes:
//   • Same-origin enforcement: rejects requests whose Origin header does
//     not match the Host header. This blocks cross-site fetch attempts.
//   • Residual XSS risk: an XSS payload running on the same origin can
//     still call this endpoint. Mitigate with a strict Content-Security-Policy
//     (CSP) header. The long-term fix is to proxy all backend calls through
//     Next.js route handlers so the token never leaves the server.
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/server/session"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  // ── Same-origin enforcement ───────────────────────────────────────────────
  const origin = request.headers.get("origin")
  const host = request.headers.get("host")
  if (origin) {
    try {
      const originHost = new URL(origin).host
      if (originHost !== host) {
        return NextResponse.json({ message: "Forbidden." }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 })
    }
  }

  const session = await getSession()
  if (!session?.accessToken) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 })
  }
  return NextResponse.json({ accessToken: session.accessToken })
}
