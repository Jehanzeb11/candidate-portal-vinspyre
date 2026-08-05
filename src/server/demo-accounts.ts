// ---------------------------------------------------------------------------
// Demo accounts — server-only
// Used when NEXT_PUBLIC_API_BASE_URL is not set. Remove once backend is live.
// ---------------------------------------------------------------------------
import "server-only"
import { timingSafeEqual } from "crypto"
import type { User } from "@/types"

export interface DemoAccount {
  email: string
  password: string
  user: Omit<User, "createdAt">
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "admin@example.com",
    password: "Admin@1234",
    user: { id: "demo-1", name: "Admin User", email: "admin@example.com", role: "admin" },
  },
  {
    email: "manager@example.com",
    password: "Manager@1234",
    user: { id: "demo-2", name: "Jane Manager", email: "manager@example.com", role: "manager" },
  },
  {
    email: "viewer@example.com",
    password: "Viewer@1234",
    user: { id: "demo-3", name: "View Only", email: "viewer@example.com", role: "viewer" },
  },
]

/**
 * Timing-safe password comparison to prevent timing-attack side-channels.
 * Buffers must be the same length for timingSafeEqual; we pad/truncate
 * via Buffer allocation so the comparison always runs in constant time.
 */
function safeComparePasswords(candidate: string, stored: string): boolean {
  const a = Buffer.from(candidate)
  const b = Buffer.from(stored)
  // Always compare buffers of identical length to avoid early-exit leaks.
  const len = Math.max(a.length, b.length)
  const aBuf = Buffer.alloc(len)
  const bBuf = Buffer.alloc(len)
  a.copy(aBuf)
  b.copy(bBuf)
  return timingSafeEqual(aBuf, bBuf)
}

export function findDemoAccount(email: string, password: string): DemoAccount | undefined {
  return DEMO_ACCOUNTS.find(
    (a) =>
      a.email.toLowerCase() === email.toLowerCase() &&
      safeComparePasswords(password, a.password)
  )
}
