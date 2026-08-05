// ---------------------------------------------------------------------------
// GET /api/auth/me
//
// Two modes:
//   • Demo  — verifies the signed identity JWT and returns the profile.
//   • Production — proxies to the backend GET /auth/me.
// ---------------------------------------------------------------------------
import { NextResponse } from "next/server"
import { getSession, verifyIdentityToken } from "@/server/session"
import { IS_DEMO_MODE, API_BASE_URL } from "@/constants"
import type { User } from "@/types"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getSession()
  if (!session?.accessToken) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 })
  }

  // ── Demo mode: verify and decode the locally-minted identity token ─────────
  if (IS_DEMO_MODE) {
    const identity = await verifyIdentityToken(session.accessToken)
    if (!identity) {
      return NextResponse.json({ message: "Invalid session." }, { status: 401 })
    }
    const user: User = {
      id: identity.sub,
      name: identity.name,
      email: identity.email,
      role: identity.role as User["role"],
    }
    return NextResponse.json(user)
  }

  // ── Production mode: proxy to backend ─────────────────────────────────────
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
    })
    if (!res.ok) {
      return NextResponse.json({ message: "Unauthenticated." }, { status: res.status })
    }
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ message: "Backend unavailable." }, { status: 503 })
  }
}
