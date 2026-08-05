// ---------------------------------------------------------------------------
// session-edge.ts — Edge-runtime-safe session utilities
//
// This module contains ONLY the crypto operations that middleware needs.
// It has NO "server-only" import and NO Node.js-only APIs (no `cookies()`).
//
// Rule: proxy.ts must import from here, NOT from server/session.ts.
//       All other server code should continue using server/session.ts.
// ---------------------------------------------------------------------------
import { SignJWT, jwtVerify } from "jose"
import { SESSION_COOKIE, SESSION_DURATION_MS } from "@/constants"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SessionPayload {
  accessToken: string
  expiresAt: number
}

// ─── Key derivation ───────────────────────────────────────────────────────────

function getEncodedKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET?.trim()
  if (!secret) throw new Error("SESSION_SECRET is not set.")
  return new TextEncoder().encode(secret)
}

// ─── Encrypt / decrypt ───────────────────────────────────────────────────────

export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getEncodedKey())
}

export async function decryptSession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getEncodedKey(), {
      algorithms: ["HS256"],
    })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

// ─── refreshSession ───────────────────────────────────────────────────────────

/**
 * Slide the cookie expiry window.
 * Called by proxy on every authenticated request.
 * Returns null if the token is invalid or expired.
 */
export async function refreshSession(raw: string): Promise<string | null> {
  const payload = await decryptSession(raw)
  if (!payload) return null
  const expiresAt = Date.now() + SESSION_DURATION_MS
  return encryptSession({ ...payload, expiresAt })
}

export { SESSION_COOKIE, SESSION_DURATION_MS }
