// ---------------------------------------------------------------------------
// POST /api/auth/logout
//
// Clears the session cookie. Optionally notifies the backend to
// invalidate the token server-side (if your backend supports it).
// ---------------------------------------------------------------------------
import { NextResponse } from "next/server"
import { deleteSession, getSession } from "@/server/session"
import { API_BASE_URL } from "@/constants"

export async function POST() {
  const session = await getSession()

  // Best-effort: tell the backend to revoke the token
  if (session?.accessToken && API_BASE_URL) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
      })
    } catch {
      // Ignore — always clear the local cookie regardless
    }
  }

  await deleteSession()
  return NextResponse.json({ ok: true })
}
