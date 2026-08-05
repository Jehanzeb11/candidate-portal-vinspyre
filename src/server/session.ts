// ---------------------------------------------------------------------------
// Session — server-only (Node.js runtime)
//
// Uses the crypto primitives from session-edge.ts and adds the Node.js-only
// operations: reading/writing cookies via next/headers.
//
// proxy.ts (Next.js 16) also imports from this file directly since the
// proxy now defaults to the Node.js runtime.
// ---------------------------------------------------------------------------
import "server-only"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { SESSION_COOKIE, SESSION_DURATION_MS } from "@/constants"
import { env } from "@/server/env"
import {
  encryptSession,
  decryptSession,
  type SessionPayload,
} from "@/server/session-edge"

// Re-export SessionPayload so callers only need one import.
export type { SessionPayload }

// ─── Identity token types ─────────────────────────────────────────────────────

/** Shape of a demo / internal identity token payload. */
export interface IdentityPayload {
  sub: string
  email: string
  name: string
  role: string
  demo?: boolean
}

// ─── Key derivation ───────────────────────────────────────────────────────────

/**
 * Returns the HMAC key derived from SESSION_SECRET.
 * Exported so route handlers can verify identity tokens without duplicating
 * the key derivation logic.
 */
export function getEncodedKey(): Uint8Array {
  return new TextEncoder().encode(env.SESSION_SECRET)
}

// ─── Identity token helpers ───────────────────────────────────────────────────

/**
 * Mint a signed JWT that encodes user identity for demo / internal use.
 * Verifiable anywhere with getEncodedKey() + jwtVerify.
 */
export async function mintIdentityToken(
  identity: IdentityPayload
): Promise<string> {
  return new SignJWT({ ...identity })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getEncodedKey())
}

/**
 * Verify and decode an identity token.
 * Returns null if the token is invalid or expired.
 */
export async function verifyIdentityToken(
  token: string
): Promise<IdentityPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getEncodedKey(), {
      algorithms: ["HS256"],
    })
    return payload as unknown as IdentityPayload
  } catch {
    return null
  }
}

// ─── Session cookie helpers (Node.js only) ───────────────────────────────────

/** Seal the backend token into an httpOnly cookie. */
export async function createSession(accessToken: string): Promise<void> {
  const expiresAt = Date.now() + SESSION_DURATION_MS
  const sealed = await encryptSession({ accessToken, expiresAt })
  const store = await cookies()

  store.set(SESSION_COOKIE, sealed, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(expiresAt),
  })
}

/** Return the session payload, or null if missing / expired / tampered. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies()
  const raw = store.get(SESSION_COOKIE)?.value
  if (!raw) return null

  const payload = await decryptSession(raw)
  if (!payload || payload.expiresAt < Date.now()) return null

  return payload
}

/** Remove the session cookie (logout). */
export async function deleteSession(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

/** Slide the cookie expiry window — convenience wrapper for Node.js contexts. */
export { refreshSession } from "@/server/session-edge"
