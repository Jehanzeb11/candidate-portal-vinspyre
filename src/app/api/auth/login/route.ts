// ---------------------------------------------------------------------------
// POST /api/auth/login  — BFF login route
//
// Two modes:
//   • Demo mode  (NEXT_PUBLIC_API_BASE_URL is empty)
//     Checks DEMO_ACCOUNTS, mints a signed identity JWT via mintIdentityToken.
//
//   • Production mode  (NEXT_PUBLIC_API_BASE_URL is set)
//     Forwards credentials to the backend, seals the returned token.
//
// The client never sees the raw token in either mode.
// Rate limited: 10 attempts per IP per 60 seconds.
// ---------------------------------------------------------------------------
import { NextResponse, type NextRequest } from "next/server"
import { createSession, mintIdentityToken } from "@/server/session"
import { findDemoAccount } from "@/server/demo-accounts"
import { LoginSchema } from "@/features/auth/validations"
import { IS_DEMO_MODE, API_BASE_URL } from "@/constants"
import { loginRateLimiter } from "@/server/rate-limit"

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── Rate limiting ─────────────────────────────────────────────────────────
  // Key on IP address; fall back to a fixed string if unavailable (dev).
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"

  const { ok, retryAfterMs } = loginRateLimiter.check(ip)
  if (!ok) {
    const retryAfterSeconds = Math.ceil((retryAfterMs ?? 60_000) / 1000)
    return NextResponse.json(
      { message: "Too many login attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      }
    )
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 })
  }

  const parsed = LoginSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed.", errors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { email, password } = parsed.data

  // ── Demo mode ──────────────────────────────────────────────────────────────
  if (IS_DEMO_MODE) {
    const match = findDemoAccount(email, password)
    if (!match) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 })
    }

    const accessToken = await mintIdentityToken({
      sub: match.user.id,
      email: match.user.email,
      name: match.user.name,
      role: match.user.role,
      demo: true,
    })
    await createSession(accessToken)
    // Reset the rate limit counter after a successful login.
    loginRateLimiter.reset(ip)
    return NextResponse.json({ ok: true })
  }

  // ── Production mode ────────────────────────────────────────────────────────
  try {
    const backendRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!backendRes.ok) {
      const errorBody = (await backendRes.json().catch(() => ({}))) as { message?: string }
      return NextResponse.json(
        { message: errorBody.message ?? "Invalid credentials." },
        { status: backendRes.status }
      )
    }

    const body = (await backendRes.json()) as { accessToken?: string }
    if (!body.accessToken) {
      return NextResponse.json({ message: "Unexpected response from server." }, { status: 502 })
    }

    await createSession(body.accessToken)
    // Reset the rate limit counter after a successful login.
    loginRateLimiter.reset(ip)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[/api/auth/login]", err)
    return NextResponse.json(
      { message: "Unable to reach the authentication server. Please try again." },
      { status: 503 }
    )
  }
}
